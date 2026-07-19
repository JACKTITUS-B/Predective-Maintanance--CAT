import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

export const MachineDetails: React.FC = () => {
  const [selectedMachineId, setSelectedMachineId] = useState("CAT-797F-PE01");
  const [reportDownloading, setReportDownloading] = useState(false);
  const [timeTick, setTimeTick] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Seed machine profiles
  const machinesList = [
    { id: "CAT-797F-PE01", name: "CAT 797F Mining Truck #01", site: "PSG CAS", serial: "CAT-797F-PE01", status: "warning", runtime: 12450, model: "797F Large Mining Truck" },
    { id: "CAT-320-PE03", name: "CAT 320 Excavator #03", site: "PSG CAS", serial: "CAT-320-PE03", status: "operational", runtime: 4320, model: "320 Medium Excavator" },
    { id: "CAT-D11-PE07", name: "CAT D11 Track Dozer #07", site: "PSG CAS", serial: "CAT-D11-PE07", status: "operational", runtime: 8940, model: "D11 Heavy Crawler Dozer" }
  ];

  const currentMachine = machinesList.find((m) => m.id === selectedMachineId) || machinesList[0];

  // Live telemetry stream simulator
  const [telemetry, setTelemetry] = useState({
    temp: 74.2,
    rpm: 1850,
    engineLoad: 72,
    oilPressure: 45.4,
    hydraulicPressure: 38.2,
    batteryVoltage: 12.6,
    fuelLevel: 68.5,
    coolantTemp: 78.4,
    humidity: 45,
    vibeX: 1.2,
    vibeY: 1.5,
    vibeZ: 2.1
  });

  const [historyPoints, setHistoryPoints] = useState<Array<{ time: number; value: number }>>([]);

  // Telemetry WebSocket + local fallback loop
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      try {
        const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = window.location.hostname === "localhost" ? "localhost:8000" : window.location.host;
        const wsUrl = `${wsProto}//${wsHost}/ws/telemetry/`;
        
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "telemetry_update") {
              setTelemetry(data.telemetry);
              setHistoryPoints((prev) => {
                const next = [...prev, { time: data.tick, value: data.telemetry.vibeZ }];
                return next.slice(-20);
              });
            }
          } catch (e) {
            // Error parsing message
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
      }
    };

    connectWebSocket();

    // Local simulation fallback runs only if WS is disconnected
    fallbackTimer = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setTimeTick((prev) => prev + 1);
        
        const isWarning = currentMachine.status === "warning";
        const tempDrift = isWarning ? 82.5 + Math.random() * 5 : 72 + Math.random() * 3;
        const vibeZDrift = isWarning ? 3.2 + Math.random() * 1.5 : 1.8 + Math.random() * 0.5;

        setTelemetry({
          temp: parseFloat(tempDrift.toFixed(1)),
          rpm: Math.floor(1800 + Math.random() * 120),
          engineLoad: Math.floor(65 + Math.random() * 15),
          oilPressure: parseFloat((40 + Math.random() * 8).toFixed(1)),
          hydraulicPressure: parseFloat((35 + Math.random() * 6).toFixed(1)),
          batteryVoltage: parseFloat((12.4 + Math.random() * 0.4).toFixed(2)),
          fuelLevel: parseFloat((68.5 - (timeTick * 0.01)).toFixed(2)),
          coolantTemp: parseFloat((tempDrift + 4.2).toFixed(1)),
          humidity: Math.floor(42 + Math.random() * 6),
          vibeX: parseFloat((0.8 + Math.random() * 0.5).toFixed(2)),
          vibeY: parseFloat((1.1 + Math.random() * 0.6).toFixed(2)),
          vibeZ: parseFloat(vibeZDrift.toFixed(2))
        });

        setHistoryPoints((prev) => {
          const next = [...prev, { time: timeTick, value: parseFloat(vibeZDrift.toFixed(2)) }];
          return next.slice(-20);
        });
      }
    }, 1000);

    return () => {
      if (ws) {
        ws.close();
      }
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
    };
  }, [selectedMachineId, timeTick, currentMachine]);

  // Derived failure state metrics
  const healthScore = currentMachine.status === "warning" ? 74.5 : 95.8;
  const rulHours = currentMachine.status === "warning" ? 48 : 740;
  const failureProbability = currentMachine.status === "warning" ? "64%" : "4%";

  // AI recommendations based on state
  const aiRecommendations = currentMachine.status === "warning" 
    ? [
        { priority: "HIGH", text: "Vibration Z-axis exceeds threshold (3.0 mm/s). Plan bearing lubrication and alignment check." },
        { priority: "MEDIUM", text: "Coolant temperature is elevated. Verify radiator airflow and check for fluid blockages." },
        { priority: "LOW", text: "Schedule inspection during the next shift change to avoid secondary damage." }
      ]
    : [
        { priority: "NOMINAL", text: "All sensor telemetry remains within safe historical operating limits." },
        { priority: "LOW", text: "Perform routine filter and lubrication checks in 140 operating hours." }
      ];

  // Predictions timeline events
  const timelineEvents = [
    { label: "Anomaly Detected", time: "18 hours ago", text: "FastAPI AI flagged high-frequency vibration drift on Z-axis" },
    { label: "Stress Trigger", time: "12 hours ago", text: "Engine thermal load exceeded nominal 80°C threshold" },
    { label: "RUL Alert Raised", time: "8 hours ago", text: "RUL dropped below 100 hours, dispatching maintenance warning" }
  ];

  // Maintenance & Service History records
  const maintenanceHistory = [
    { date: "2026-05-12", task: "Hydraulic pump assembly replace", tech: "John Doe", cost: "$4,250", status: "completed" },
    { date: "2026-03-04", task: "Engine oil and filters replacement", tech: "Alex Smith", cost: "$680", status: "completed" }
  ];

  const serviceHistory = [
    { date: "2026-06-20", task: "Alternator inspection & voltage check", tech: "Elena Rostova", result: "Nominal 12.8V output verified" },
    { date: "2026-04-18", task: "Vibration sensor calibration check", tech: "Mark Vance", result: "Transducer cleaned and realigned" }
  ];

  // Report downloader simulation
  const handleDownload = () => {
    setReportDownloading(true);
    setTimeout(() => {
      const dataStr = `CATERPILLAR PREDICTIVE MAINTENANCE REPORT
Generated: ${new Date().toISOString()}
Asset: ${currentMachine.name}
Serial: ${currentMachine.serial}
Site: ${currentMachine.site}
Runtime: ${currentMachine.runtime} hours

METRICS SUMMARY:
Health Score: ${healthScore}%
Remaining Useful Life (RUL): ${rulHours} hours
Active Warnings: ${currentMachine.status === "warning" ? "Bearing Vibration" : "None"}

LATEST TELEMETRY SENSORS:
Temperature: ${telemetry.temp} C
Coolant Temp: ${telemetry.coolantTemp} C
Engine RPM: ${telemetry.rpm}
Load Level: ${telemetry.engineLoad}%
Oil Pressure: ${telemetry.oilPressure} psi
Hydraulic Pressure: ${telemetry.hydraulicPressure} psi
Battery Voltage: ${telemetry.batteryVoltage} V
Vibration (Z-Axis): ${telemetry.vibeZ} mm/s`;

      const blob = new Blob([dataStr], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentMachine.serial}-inspection-report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setReportDownloading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Selector & Top Download Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFBEB]/50 dark:bg-stone-950/20 p-4 border border-stone-200 dark:border-stone-800 rounded">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Select Machinery:</span>
          <select
            value={selectedMachineId}
            onChange={(e) => {
              setSelectedMachineId(e.target.value);
              setHistoryPoints([]);
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
              }, 600);
            }}
            className="bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700 py-1.5 px-3 rounded focus:outline-none focus:border-[#FFCD00] cursor-pointer"
          >
            {machinesList.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleDownload}
          disabled={reportDownloading}
          variant="primary"
          className="flex items-center gap-2 text-xs font-bold py-1.5"
        >
          {reportDownloading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Compiling Data...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Inspection Report
            </>
          )}
        </Button>
      </div>

      {/* Info & Health Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Machine Information */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Asset Properties</span>
            <h3 className="text-md font-bold text-stone-900 dark:text-stone-50 mt-1">{currentMachine.name}</h3>
            <p className="text-xs text-[#FFCD00] font-bold uppercase mt-0.5">{currentMachine.model}</p>
          </div>
          <div className="space-y-2 mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Serial Tag:</span>
              <span className="font-mono font-bold">{currentMachine.serial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Facility Location:</span>
              <span className="font-bold">{currentMachine.site}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Accumulated Runtime:</span>
              <span className="font-bold">{currentMachine.runtime} hours</span>
            </div>
          </div>
        </Card>

        {/* Health Score Gauge */}
        <Card className="p-5 flex flex-col justify-between items-center text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Machine Health Index</span>
            <div className="relative mt-4 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-stone-800 flex items-center justify-center relative">
                <span className={`text-2xl font-extrabold ${healthScore > 80 ? "text-emerald-500" : "text-amber-500"}`}>
                  {healthScore}%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant={healthScore > 80 ? "success" : "warning"}>
              {healthScore > 80 ? "Nominal Operations" : "Stress Alert Action Req"}
            </Badge>
          </div>
        </Card>

        {/* Remaining Useful Life */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Remaining Useful Life (RUL)</span>
            <div className="mt-3">
              <span className={`text-4xl font-extrabold tracking-tight ${rulHours < 100 ? "text-red-500" : "text-cyan-500"}`}>
                {rulHours} hrs
              </span>
              <span className="text-xs text-stone-500 block mt-1">Estimated operating hours before expected overhaul</span>
            </div>
          </div>
          <div className="pt-3 mt-4 border-t border-stone-200 dark:border-stone-800 flex justify-between text-xs">
            <span className="text-stone-500">Failure Probability:</span>
            <span className="font-bold text-red-500">{failureProbability}</span>
          </div>
        </Card>

      </div>

      {/* Live Sensors Grid & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Sensors telemetry display */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? "bg-emerald-500 animate-ping" : "bg-[#FFCD00] animate-ping"}`} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Live Telemetry Metrics (1Hz Frequency)</h3>
            </div>
            <Badge variant={wsConnected ? "success" : "warning"} className="normal-case font-bold text-[9px] px-1.5 py-0">
              {wsConnected ? "WS: Connected" : "WS: Simulated Fallback"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-300 dark:border-stone-800 space-y-2.5">
                  <Skeleton className="h-2 w-1/2" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
              ))
            ) : (
              <>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Engine Temp</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">{telemetry.temp} °C</div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Engine RPM</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">{telemetry.rpm} RPM</div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Engine Load</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">{telemetry.engineLoad} %</div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Oil Pressure</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">{telemetry.oilPressure} psi</div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Hydraulic PSI</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">{telemetry.hydraulicPressure} psi</div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Battery Volt</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">{telemetry.batteryVoltage} V</div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Fuel Level</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">{telemetry.fuelLevel} %</div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] uppercase font-bold text-stone-500">Vibration Z</span>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-50 mt-1">{telemetry.vibeZ} mm/s</div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Live Scrolling Waveform Chart */}
        <Card className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Z-Axis Vibration Waveform</h3>
          <p className="text-xs text-stone-500 mb-4">Scrolling window tracking vibration magnitude</p>
          <div className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[100px] w-full" />
            ) : (
              <Chart data={historyPoints} maxScale={6} strokeColor="#FFCD00" height={100} />
            )}
          </div>
        </Card>

      </div>

      {/* AI Recommendation & Predictions Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Recommendations */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4">FastAPI AI Maintenance Prescription</h3>
          <div className="space-y-3">
            {aiRecommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-300 dark:border-stone-800 flex items-start gap-3">
                <Badge variant={rec.priority === "HIGH" ? "danger" : rec.priority === "MEDIUM" ? "warning" : "success"}>
                  {rec.priority}
                </Badge>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-5">{rec.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Prediction Timeline */}
        <Card className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Anomaly Timeline Events</h3>
          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
            {timelineEvents.map((ev, i) => (
              <div key={i} className="pl-6 relative">
                <span className="absolute left-[3px] top-[5px] w-2.5 h-2.5 rounded-full bg-[#FFCD00] border border-stone-900" />
                <span className="text-[10px] text-stone-500 font-mono block">{ev.time}</span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block mt-0.5">{ev.label}</span>
                <p className="text-[11px] text-stone-500 leading-4 mt-0.5">{ev.text}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Maintenance & Service History */}
      <Card>
        <CardHeader className="py-4 border-b border-stone-200 dark:border-stone-800">
          <CardTitle>Historical Log & Calibration Registers</CardTitle>
          <CardDescription>Comprehensive ledger of past maintenance repairs and electrical validations</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800">
          
          {/* Left Column: Maintenance History */}
          <div className="p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Repair & Overhaul Records</h4>
            <div className="space-y-3">
              {maintenanceHistory.map((m, i) => (
                <div key={i} className="text-xs pb-3 last:pb-0 border-b last:border-0 border-stone-200 dark:border-stone-800 flex justify-between">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{m.task}</span>
                    <span className="text-[10px] text-stone-500 block mt-1 font-mono">Date: {m.date} | Tech: {m.tech}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block">{m.cost}</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase block mt-1">{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Service/Calibration Records */}
          <div className="p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Calibration & Inspection Audits</h4>
            <div className="space-y-3">
              {serviceHistory.map((s, i) => (
                <div key={i} className="text-xs pb-3 last:pb-0 border-b last:border-0 border-stone-200 dark:border-stone-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-stone-900 dark:text-stone-100">{s.task}</span>
                    <span className="text-[10px] text-stone-500 font-mono">Date: {s.date}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-4 mt-1">Audit result: {s.result}</p>
                  <span className="text-[9px] text-stone-400 mt-1 block">Inspected by: {s.tech}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
};
