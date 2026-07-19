import numpy as np
from datetime import datetime, timedelta
from typing import List, Tuple
import json
from sqlalchemy.orm import Session
from app.models import SensorData, Machine, Prediction
from app.schemas import Recommendation, HealthScoreResponse, AnomalyDetail, AnomalyDetectionResponse


class PredictiveMaintenanceService:
    # Safe limits definitions
    THRESHOLDS = {
        "temperature": {"min": 0.0, "max": 80.0, "extreme": 110.0},
        "vibration": {"min": 0.0, "max": 3.0, "extreme": 7.0},
        "pressure": {"min": 25.0, "max": 55.0, "extreme_low": 15.0, "extreme_high": 75.0},
        "voltage": {"min": 11.5, "max": 14.5, "extreme_low": 10.0, "extreme_high": 16.0},
    }

    @classmethod
    def calculate_health_and_prediction(
        cls, db: Session, machine: Machine
    ) -> HealthScoreResponse:
        """
        Calculates machine health score, failure probability, RUL, and recommendations.
        Queries the database for recent telemetry. Falls back to default operational 
        metrics if no data exists.
        """
        # Fetch last 50 telemetry points
        telemetry = (
            db.query(SensorData)
            .filter(SensorData.machine_id == machine.id)
            .order_by(SensorData.timestamp.desc())
            .limit(50)
            .all()
        )

        evaluated_at = datetime.utcnow()

        if not telemetry:
            # Fallback values for machines with no sensor logs yet
            return cls._generate_nominal_health(machine.id, machine.name, evaluated_at)

        # Extract values
        temps = [t.temperature for t in telemetry if t.temperature is not None]
        vibes = [t.vibration for t in telemetry if t.vibration is not None]
        pressures = [t.pressure for t in telemetry if t.pressure is not None]
        voltages = [t.voltage for t in telemetry if t.voltage is not None]
        speeds = [t.speed for t in telemetry if t.speed is not None]

        # Extract extra_data fields
        extra_logs = []
        for t in telemetry:
            if t.extra_data:
                try:
                    if isinstance(t.extra_data, str):
                        extra_logs.append(json.loads(t.extra_data))
                    else:
                        extra_logs.append(t.extra_data)
                except Exception:
                    pass

        # Sub-metrics lists
        loads = [log.get("engine_load") for log in extra_logs if log.get("engine_load") is not None]
        hyd_pressures = [log.get("hydraulic_pressure") for log in extra_logs if log.get("hydraulic_pressure") is not None]
        coolant_temps = [log.get("coolant_temperature") for log in extra_logs if log.get("coolant_temperature") is not None]

        # Calculate averages of recent logs (latest 5 points for immediate state)
        recent_temp = np.mean(temps[:5]) if temps else 65.0
        recent_vibe = np.mean(vibes[:5]) if vibes else 1.8
        recent_pres = np.mean(pressures[:5]) if pressures else 40.0
        recent_volt = np.mean(voltages[:5]) if voltages else 13.0
        recent_speed = np.mean(speeds[:5]) if speeds else 1500.0
        
        recent_load = np.mean(loads[:5]) if loads else 60.0
        recent_hyd_pres = np.mean(hyd_pressures[:5]) if hyd_pressures else 45.0
        recent_cool_temp = np.mean(coolant_temps[:5]) if coolant_temps else 70.0

        # Calculate 6 risk coefficients (0.0 to 1.0)
        # 1. Bearing Failure Risk (vibration exceeds 3.0 mm/s)
        bearing_risk = 0.0
        if recent_vibe > 3.0:
            bearing_risk = min(1.0, (recent_vibe - 3.0) / 4.0)
        elif recent_vibe > 1.8:
            bearing_risk = (recent_vibe - 1.8) / 1.2 * 0.25  # mild warning

        # 2. Hydraulic Failure Risk (hydraulic pressure out of range 25.0 - 55.0)
        hyd_risk = 0.0
        if recent_hyd_pres > 55.0:
            hyd_risk = min(1.0, (recent_hyd_pres - 55.0) / 20.0)
        elif recent_hyd_pres < 25.0:
            hyd_risk = min(1.0, (25.0 - recent_hyd_pres) / 10.0)

        # 3. Engine Failure Risk (heavy engine load > 80% coupled with high speed > 2200 RPM)
        engine_risk = 0.0
        if recent_load > 80.0:
            engine_risk += (recent_load - 80.0) / 20.0 * 0.6
        if recent_speed > 2200.0:
            engine_risk += (recent_speed - 2200.0) / 800.0 * 0.4
        engine_risk = min(1.0, engine_risk)

        # 4. Oil Leakage Risk (oil pressure drops below 30 psi)
        oil_leak_risk = 0.0
        if recent_pres < 30.0:
            oil_leak_risk = min(1.0, (30.0 - recent_pres) / 15.0)
        elif recent_pres < 36.0:
            oil_leak_risk = (36.0 - recent_pres) / 6.0 * 0.3  # mild warning

        # 5. Cooling Failure Risk (coolant temp > 80C or engine temp > 75C)
        cooling_risk = 0.0
        if recent_cool_temp > 80.0:
            cooling_risk += (recent_cool_temp - 80.0) / 30.0 * 0.6
        if recent_temp > 75.0:
            cooling_risk += (recent_temp - 75.0) / 30.0 * 0.4
        cooling_risk = min(1.0, cooling_risk)

        # 6. Battery Failure Risk (voltage drops < 11.5V or spikes > 14.5V)
        battery_risk = 0.0
        if recent_volt < 11.5:
            battery_risk = min(1.0, (11.5 - recent_volt) / 1.5)
        elif recent_volt > 14.5:
            battery_risk = min(1.0, (recent_volt - 14.5) / 1.5)

        # 2. Failure Probability Calculation (Derived as max of 6 risk parameters)
        failure_prob = max(bearing_risk, hyd_risk, engine_risk, oil_leak_risk, cooling_risk, battery_risk)

        # 3. Health Score Calculation (Complement of failure probability)
        health_score = 100.0 * (1.0 - failure_prob)
        health_score = max(0.0, min(100.0, health_score))

        # 4. Remaining Useful Life (RUL) Hours
        # Safe operating limit is 2000 hours, degrading quadratically with failure probability
        base_rul = 2000.0
        rul_hours = base_rul * ((1.0 - failure_prob) ** 2)
        # If failure probability is high, drop RUL rapidly
        if failure_prob > 0.75:
            rul_hours = max(2.0, rul_hours * 0.1)  # urgent attention needed
        rul_hours = max(0.0, round(rul_hours, 1))

        # 5. Anomaly score (Standard deviation-based anomaly flag)
        is_anomaly = False
        anomaly_score = 0.0
        
        # Calculate standard deviation z-score if we have enough historical data
        if len(vibes) >= 10:
            hist_mean = np.mean(vibes)
            hist_std = np.std(vibes)
            if hist_std > 0.01:
                z = abs(recent_vibe - hist_mean) / hist_std
                anomaly_score = min(1.0, z / 4.0)
                if z > 2.5:
                    is_anomaly = True

        # 6. Predict specific Failure Mode & Generate Recommendations
        failure_mode = "Normal Operation"
        recommendations = []

        if failure_prob > 0.25:
            risks = {
                "Bearing Failure": bearing_risk,
                "Hydraulic Failure": hyd_risk,
                "Engine Failure": engine_risk,
                "Oil Leakage": oil_leak_risk,
                "Cooling Failure": cooling_risk,
                "Battery Failure": battery_risk
            }
            # Assign the mode with the highest computed risk coefficient
            failure_mode = max(risks, key=risks.get)

            # Bearing Failure Recommendations
            if bearing_risk > 0.4:
                priority = "critical" if bearing_risk > 0.8 else "high" if bearing_risk > 0.6 else "medium"
                recommendations.append(
                    Recommendation(
                        action="Perform Bearing Lubrication & Alignment Check",
                        priority=priority,
                        description=f"Severe mechanical vibrations detected ({recent_vibe:.2f} mm/s). High risk of bearing seize or wear."
                    )
                )

            # Hydraulic Failure Recommendations
            if hyd_risk > 0.4:
                priority = "critical" if hyd_risk > 0.8 else "high" if hyd_risk > 0.6 else "medium"
                recommendations.append(
                    Recommendation(
                        action="Calibrate Hydraulic Pump & Check Seal Integrity",
                        priority=priority,
                        description=f"Hydraulic pressure stress detected ({recent_hyd_pres:.1f} psi). Risk of pump cavitation or valve failure."
                    )
                )

            # Engine Failure Recommendations
            if engine_risk > 0.4:
                priority = "high" if engine_risk > 0.7 else "medium"
                recommendations.append(
                    Recommendation(
                        action="Inspect Engine Compression & Flush Fuel Injectors",
                        priority=priority,
                        description=f"High thermal-load engine stress detected (load: {recent_load:.1f}%, speed: {recent_speed:.0f} RPM). Risk of head gasket damage."
                    )
                )

            # Oil Leakage Recommendations
            if oil_leak_risk > 0.4:
                priority = "critical" if oil_leak_risk > 0.8 else "high" if oil_leak_risk > 0.6 else "medium"
                recommendations.append(
                    Recommendation(
                        action="Check Gaskets for Oil Leaks & Replenish Fluid",
                        priority=priority,
                        description=f"Low engine oil pressure detected ({recent_pres:.1f} psi). Risk of oil starvation and engine block locking."
                    )
                )

            # Cooling Failure Recommendations
            if cooling_risk > 0.4:
                priority = "high" if cooling_risk > 0.7 else "medium"
                recommendations.append(
                    Recommendation(
                        action="Flush Radiator & Replace Water Pump",
                        priority=priority,
                        description=f"High engine operating temperature detected (coolant: {recent_cool_temp:.1f}°C). Risk of cylinder head warping."
                    )
                )

            # Battery Failure Recommendations
            if battery_risk > 0.4:
                priority = "high" if battery_risk > 0.7 else "medium"
                recommendations.append(
                    Recommendation(
                        action="Replace Battery Pack & Verify Alternator Output",
                        priority=priority,
                        description=f"Electrical system voltage instability ({recent_volt:.2f}V). Risk of instrumentation shutdown."
                    )
                )

        if not recommendations:
            if health_score > 95.0:
                recommendations.append(
                    Recommendation(
                        action="No actions required",
                        priority="low",
                        description="Equipment is running within nominal safe thresholds. Continue normal operation schedules."
                    )
                )
            else:
                recommendations.append(
                    Recommendation(
                        action="Schedule standard maintenance check",
                        priority="low",
                        description="Health score shows mild mechanical degradation. Schedule inspection on next route check."
                    )
                )

        return HealthScoreResponse(
            machine_id=str(machine.id),
            machine_name=machine.name,
            health_score=round(health_score, 1),
            failure_probability=round(float(failure_prob), 3),
            remaining_useful_life_hours=rul_hours,
            is_anomaly=is_anomaly,
            anomaly_score=round(float(anomaly_score), 2),
            predicted_failure_mode=failure_mode,
            recommendations=recommendations,
            evaluated_at=evaluated_at,
        )

    @classmethod
    def detect_historical_anomalies(
        cls, db: Session, machine_id: str, days: int = 7
    ) -> AnomalyDetectionResponse:
        """
        Scans historical telemetry records for anomaly timestamps using static thresholds & z-scores.
        """
        since_date = datetime.utcnow() - timedelta(days=days)
        telemetry = (
            db.query(SensorData)
            .filter(SensorData.machine_id == machine_id)
            .filter(SensorData.timestamp >= since_date)
            .order_by(SensorData.timestamp.asc())
            .all()
        )

        anomalies = []
        if not telemetry:
            return AnomalyDetectionResponse(
                machine_id=str(machine_id), total_anomalies_detected=0, anomalies=[]
            )

        # Extract values for running stats
        temps = [t.temperature for t in telemetry if t.temperature is not None]
        vibes = [t.vibration for t in telemetry if t.vibration is not None]

        mean_vibe = np.mean(vibes) if vibes else 1.5
        std_vibe = np.std(vibes) if vibes else 0.5
        mean_temp = np.mean(temps) if temps else 60.0
        std_temp = np.std(temps) if temps else 10.0

        for t in telemetry:
            # Check vibration z-score
            if t.vibration is not None and std_vibe > 0.05:
                z = (t.vibration - mean_vibe) / std_vibe
                if z > 2.5:
                    anomalies.append(
                        AnomalyDetail(
                            timestamp=t.timestamp,
                            metric="vibration",
                            value=t.vibration,
                            threshold=round(mean_vibe + 2.5 * std_vibe, 2),
                            z_score=round(float(z), 2),
                        )
                    )
            # Check temperature z-score
            if t.temperature is not None and std_temp > 1.0:
                z = (t.temperature - mean_temp) / std_temp
                if z > 2.5:
                    anomalies.append(
                        AnomalyDetail(
                            timestamp=t.timestamp,
                            metric="temperature",
                            value=t.temperature,
                            threshold=round(mean_temp + 2.5 * std_temp, 2),
                            z_score=round(float(z), 2),
                        )
                    )

        return AnomalyDetectionResponse(
            machine_id=str(machine_id),
            total_anomalies_detected=len(anomalies),
            anomalies=anomalies,
        )

    @classmethod
    def _generate_nominal_health(
        cls, machine_id: str, name: str, evaluated_at: datetime
    ) -> HealthScoreResponse:
        # Default fallback response for machines with zero sensor logs
        return HealthScoreResponse(
            machine_id=str(machine_id),
            machine_name=name,
            health_score=100.0,
            failure_probability=0.0,
            remaining_useful_life_hours=2000.0,
            is_anomaly=False,
            anomaly_score=0.0,
            predicted_failure_mode="Normal Operation",
            recommendations=[
                Recommendation(
                    action="Ingest Telemetry Logs",
                    priority="low",
                    description="No sensor readings detected for this machinery. Please feed sensor logs to start AI evaluation.",
                )
            ],
            evaluated_at=evaluated_at,
        )
