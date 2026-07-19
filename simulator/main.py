import os
import sys
import time
import uuid
import random
import math
import json
import logging
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# 1. Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("SensorSimulator")

# Load environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable is missing!")
    sys.exit(1)


# 2. Database Auto-Provisioning & Seeding
def provision_database(conn):
    """
    Ensures that a site manager, site, and at least 100 machines exist
    in the database to run the simulation against.
    """
    with conn.cursor() as cur:
        # A. Verify/Get Roles
        cur.execute("SELECT id FROM roles WHERE name = 'Site Manager'")
        row = cur.fetchone()
        if not row:
            manager_role_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO roles (id, name, description) VALUES (%s, %s, %s)",
                (manager_role_id, "Site Manager", "Facility operations manager"),
            )
            logger.info("Provisioned 'Site Manager' role.")
        else:
            manager_role_id = row[0]

        # B. Verify/Get Users
        cur.execute("SELECT id FROM users LIMIT 1")
        row = cur.fetchone()
        if not row:
            # Create a default manager user
            manager_user_id = str(uuid.uuid4())
            # Default PBKDF2 hash of password "Caterpillar2026!"
            password_hash = "pbkdf2_sha256$600000$some_salt$uU72Nn9LzO4JpxV/1TkiC=" 
            cur.execute(
                "INSERT INTO users (id, username, email, password_hash, role_id) VALUES (%s, %s, %s, %s, %s)",
                (manager_user_id, "cat_manager", "manager@caterpillar.com", password_hash, manager_role_id),
            )
            logger.info("Provisioned default Site Manager user.")
        else:
            manager_user_id = row[0]

        # C. Verify/Get Sites
        cur.execute("SELECT id FROM sites LIMIT 1")
        row = cur.fetchone()
        if not row:
            site_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO sites (id, name, location, manager_id) VALUES (%s, %s, %s, %s)",
                (site_id, "Peoria Assembly Facility", "Peoria, IL", manager_user_id),
            )
            logger.info("Provisioned default Site: Peoria Assembly Facility.")
        else:
            site_id = row[0]

        # D. Verify/Scale Machines count to at least 105
        cur.execute("SELECT id, name, serial_number FROM machines")
        machines = cur.fetchall()
        machine_count = len(machines)
        logger.info(f"Currently found {machine_count} machines in database.")

        if machine_count < 105:
            machines_needed = 105 - machine_count
            logger.info(f"Seeding {machines_needed} additional machines for simulation...")
            models = ["797F", "320", "D11", "988", "CB10"]
            names = ["CAT Mining Truck", "CAT Excavator", "CAT Dozer", "CAT Wheel Loader", "CAT Utility Roller"]
            
            for i in range(machines_needed):
                idx = machine_count + i
                m_id = str(uuid.uuid4())
                model = random.choice(models)
                name = names[models.index(model)]
                serial = f"CAT-{model}-SIM{idx:03d}"
                
                cur.execute(
                    "INSERT INTO machines (id, site_id, name, model, serial_number, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (m_id, site_id, f"{name} #{idx+1}", model, serial, "operational"),
                )
            conn.commit()
            logger.info("Seeded 105 total simulation machines successfully.")
            
        # E. Fetch and return list of all active machine IDs
        cur.execute("SELECT id, name FROM machines")
        return cur.fetchall()


# 3. Telemetry Generation States
class MachineState:
    def __init__(self, machine_id, name):
        self.machine_id = machine_id
        self.name = name
        
        # Baselines
        self.temp = random.uniform(60.0, 70.0)
        self.rpm = random.uniform(1400.0, 1600.0)
        self.load = random.uniform(50.0, 70.0)
        self.oil_pressure = random.uniform(35.0, 45.0)
        self.hyd_pressure = random.uniform(40.0, 50.0)
        self.voltage = random.uniform(12.8, 13.6)
        self.fuel = random.uniform(60.0, 100.0)
        self.coolant_temp = random.uniform(65.0, 75.0)
        self.humidity = random.uniform(40.0, 60.0)
        self.runtime = random.uniform(500.0, 2500.0)
        
        # Vibrations
        self.vibe_x = random.uniform(0.8, 1.2)
        self.vibe_y = random.uniform(0.8, 1.2)
        self.vibe_z = random.uniform(0.8, 1.2)

        # State: normal, spiking, failing, broken
        self.status = "normal"
        self.status_duration = 0
        self.spike_metric = None
        
    def step(self):
        """
        Calculates one second of gradual value changes, anomalies, and failures.
        """
        self.status_duration += 1
        self.runtime += 1.0 / 3600.0  # Increment operating hours

        # Refuel checking
        self.fuel -= random.uniform(0.001, 0.003)
        if self.fuel < 5.0:
            self.fuel = 100.0  # Refueled!
            logger.info(f"Machine {self.name} refueled to 100%.")

        if self.status == "normal":
            # 1. Gradual random walks
            self.temp += random.uniform(-0.3, 0.3)
            self.rpm += random.uniform(-15, 15)
            self.load += random.uniform(-1.5, 1.5)
            self.oil_pressure += random.uniform(-0.2, 0.2)
            self.hyd_pressure += random.uniform(-0.3, 0.3)
            self.voltage += random.uniform(-0.02, 0.02)
            self.coolant_temp += random.uniform(-0.2, 0.2)
            self.humidity += random.uniform(-0.1, 0.1)
            
            self.vibe_x += random.uniform(-0.02, 0.02)
            self.vibe_y += random.uniform(-0.02, 0.02)
            self.vibe_z += random.uniform(-0.02, 0.02)

            # Restrict normal values back to soft clamps
            self.temp = max(55.0, min(75.0, self.temp))
            self.rpm = max(1000.0, min(2200.0, self.rpm))
            self.load = max(10.0, min(90.0, self.load))
            self.oil_pressure = max(30.0, min(50.0, self.oil_pressure))
            self.hyd_pressure = max(35.0, min(55.0, self.hyd_pressure))
            self.voltage = max(12.5, min(14.2, self.voltage))
            self.coolant_temp = max(60.0, min(80.0, self.coolant_temp))
            self.vibe_x = max(0.5, min(1.5, self.vibe_x))
            self.vibe_y = max(0.5, min(1.5, self.vibe_y))
            self.vibe_z = max(0.5, min(1.5, self.vibe_z))

            # 2. Trigger random anomaly spikes (0.1% chance per second)
            if random.random() < 0.001:
                self.status = "spiking"
                self.status_duration = 0
                self.spike_metric = random.choice(["vibration", "temperature", "pressure"])
                logger.warning(f"Machine {self.name} entered anomaly SPIKE state on metric: {self.spike_metric}")

            # 3. Trigger mechanical failure states (0.01% chance per second)
            elif random.random() < 0.0001:
                self.status = "failing"
                self.status_duration = 0
                logger.error(f"Machine {self.name} entered mechanical FAILURE DEGRADATION state!")

        elif self.status == "spiking":
            # Simulate a quick spike for 5-8 seconds
            if self.spike_metric == "vibration":
                self.vibe_x += random.uniform(0.5, 1.5)
                self.vibe_y += random.uniform(0.5, 1.5)
                self.vibe_z += random.uniform(0.5, 1.5)
            elif self.spike_metric == "temperature":
                self.temp += random.uniform(4.0, 7.0)
                self.coolant_temp += random.uniform(3.0, 5.0)
            elif self.spike_metric == "pressure":
                self.hyd_pressure += random.uniform(4.0, 8.0)
                
            if self.status_duration > random.randint(5, 8):
                self.status = "normal"
                self.status_duration = 0
                logger.info(f"Machine {self.name} anomaly spike cleared. Returned to normal.")

        elif self.status == "failing":
            # Gradually deteriorate metrics for 60 seconds leading to breakdown
            self.temp += random.uniform(0.5, 1.2)
            self.coolant_temp += random.uniform(0.4, 0.9)
            self.vibe_x += random.uniform(0.05, 0.15)
            self.vibe_y += random.uniform(0.05, 0.15)
            self.vibe_z += random.uniform(0.05, 0.15)
            self.oil_pressure -= random.uniform(0.2, 0.5)

            if self.status_duration >= 60:
                self.status = "broken"
                self.status_duration = 0
                self.rpm = 0.0
                self.load = 0.0
                self.temp = 85.0
                logger.critical(f"Machine {self.name} has suffered a SEVERE BREAKDOWN! Status offline.")

        elif self.status == "broken":
            # Cooling down, RPM is zero, offline for 40 seconds before self-repairing
            self.temp = max(40.0, self.temp - 1.0)
            self.coolant_temp = max(40.0, self.coolant_temp - 0.8)
            self.rpm = 0.0
            self.load = 0.0
            
            if self.status_duration >= 40:
                self.status = "normal"
                self.status_duration = 0
                # Reset to normal levels
                self.vibe_x = 1.0
                self.vibe_y = 1.0
                self.vibe_z = 1.0
                self.temp = 65.0
                self.coolant_temp = 70.0
                self.rpm = 1500.0
                self.oil_pressure = 40.0
                self.hyd_pressure = 45.0
                logger.info(f"Machine {self.name} completed self-repair cycle. Resuming operations.")

        # Calculate combined vibration magnitude
        combined_vibe = math.sqrt(self.vibe_x**2 + self.vibe_y**2 + self.vibe_z**2)
        
        # Compile extra_data payload
        extra_data = {
            "engine_load": round(self.load, 1),
            "hydraulic_pressure": round(self.hyd_pressure, 1),
            "fuel_level": round(self.fuel, 2),
            "coolant_temperature": round(self.coolant_temp, 1),
            "humidity": round(self.humidity, 1),
            "runtime_hours": round(self.runtime, 3),
            "vibration_x": round(self.vibe_x, 2),
            "vibration_y": round(self.vibe_y, 2),
            "vibration_z": round(self.vibe_z, 2),
        }

        return (
            self.machine_id,
            datetime.utcnow(),
            round(self.temp, 2),
            round(combined_vibe, 2),
            round(self.oil_pressure, 2),
            round(self.voltage, 2),
            round(self.rpm, 1),
            json.dumps(extra_data),
            self.status,  # return status to check if db updates are needed
        )


# 4. Main Thread Loop
def main():
    logger.info("Initializing Caterpillar Python Sensor Simulator...")
    
    # Connect to postgres
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        logger.info("Connected to PostgreSQL successfully.")
    except Exception as e:
        logger.critical(f"Failed to connect to database: {str(e)}")
        sys.exit(1)

    # Provision DB schema and fetch active machine list
    try:
        active_machines = provision_database(conn)
        logger.info(f"Active simulation list loaded with {len(active_machines)} machines.")
    except Exception as e:
        logger.critical(f"Database provisioning failed: {str(e)}")
        conn.close()
        sys.exit(1)

    # Instantiate states
    states = [MachineState(m[0], m[1]) for m in active_machines]

    telemetry_buffer = []
    last_flush_time = time.time()
    
    logger.info("Starting simulation loop. Telemetry is writing...")

    try:
        while True:
            start_time = time.time()

            # A. Step through each machine state
            for state in states:
                machine_id, timestamp, temp, vibe, pressure, voltage, speed, extra_data, status = state.step()
                telemetry_buffer.append(
                    (machine_id, timestamp, temp, vibe, pressure, voltage, speed, extra_data)
                )

                # If the machine broke down or repaired, sync its status in the 'machines' table
                if state.status_duration == 1:
                    if status == "broken":
                        db_status = "critical"
                    elif status == "failing":
                        db_status = "warning"
                    else:
                        db_status = "operational"

                    try:
                        with conn.cursor() as cur:
                            cur.execute(
                                "UPDATE machines SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                                (db_status, machine_id),
                            )
                    except Exception as e:
                        logger.error(f"Failed to sync machine status: {str(e)}")

            # B. Check if 10 seconds elapsed to flush database buffer
            current_time = time.time()
            if current_time - last_flush_time >= 10.0:
                buffer_size = len(telemetry_buffer)
                logger.info(f"Flushing {buffer_size} telemetry records to Neon DB...")
                
                try:
                    with conn.cursor() as cur:
                        # Batch insert using psycopg2 extras execute_values
                        execute_values(
                            cur,
                            """
                            INSERT INTO sensor_data 
                            (machine_id, timestamp, temperature, vibration, pressure, voltage, speed, extra_data) 
                            VALUES %s
                            ON CONFLICT (machine_id, timestamp) DO NOTHING
                            """,
                            telemetry_buffer,
                            page_size=1000,
                        )
                    logger.info(f"Successfully committed {buffer_size} records.")
                except Exception as e:
                    logger.error(f"Failed to write telemetry batch: {str(e)}")
                    # On failure, we clear the buffer to prevent memory leakage
                    # or it can retain it, but clearing keeps it healthy for hackathons.
                
                telemetry_buffer.clear()
                last_flush_time = current_time

            # C. Sync tick rate to exactly 1 second
            elapsed = time.time() - start_time
            sleep_time = max(0.0, 1.0 - elapsed)
            time.sleep(sleep_time)

    except KeyboardInterrupt:
        logger.info("Simulator interrupted by user. Exiting...")
    finally:
        conn.close()
        logger.info("PostgreSQL database connection closed.")


if __name__ == "__main__":
    main()
