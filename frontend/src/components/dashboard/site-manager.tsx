import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SiteManagerDashboardProps {
  onTriggerMessage?: (managerId: string, context: string, body: string) => void;
}

export const SiteManagerDashboard: React.FC<SiteManagerDashboardProps> = ({ onTriggerMessage }) => {
  const handleMessageClick = (machineCode: string, siteName: string, severity: string) => {
    if (onTriggerMessage) {
      onTriggerMessage(
        "admin@cat.com",
        `Regarding ${machineCode.replace("CAT ", "CAT")} - ${severity.toUpperCase()} Alert`,
        `Can you provide an update on why this machine is still in a ${severity} state?`
      );
    }
  };
  // Assigned Site Context
  const assignedSite = {
    name: "PSG CAS Facility",
    location: "PSG CAS, India",
    manager: "Mark Vance"
  };

  // Site-specific stats
  const stats = [
    { label: "Assigned Facility", value: "PSG CAS Site A", trend: "PSG CAS Location", color: "text-stone-100" },
    { label: "Average Site Health", value: "91.4%", trend: "Optimal operational index", color: "text-emerald-500 font-extrabold" },
    { label: "Active Machinery", value: "45 Assets", trend: "0 offline / 45 connected", color: "text-stone-100" },
    { label: "Daily Fuel Consumption", value: "1,420 Gal", trend: "78.4% average fuel levels", color: "text-[#FFCD00]" }
  ];

  // Site-specific Machine List
  const psgCasMachines = [
    { name: "CAT 797F Mining Truck #01", serial: "CAT-797F-PE01", status: "warning" as const, health: 74.5, temp: 78.2, vibration: 3.1 },
    { name: "CAT 320 Excavator #03", serial: "CAT-320-PE03", status: "operational" as const, health: 96.2, temp: 64.1, vibration: 1.2 },
    { name: "CAT D11 Track Dozer #07", serial: "CAT-D11-PE07", status: "operational" as const, health: 92.0, temp: 69.5, vibration: 1.8 },
    { name: "CAT 988 Wheel Loader #02", serial: "CAT-988-PE02", status: "operational" as const, health: 98.4, temp: 61.3, vibration: 0.95 },
    { name: "CAT CB10 Utility Roller #04", serial: "CAT-CB10-PE04", status: "operational" as const, health: 95.9, temp: 63.8, vibration: 1.05 }
  ];

  // Site-specific Alerts
  const siteAlerts = [
    { asset: "CAT 797F #01", mode: "Bearing Vibration Spike", time: "15m ago", severity: "warning" as const },
    { asset: "CAT D11 #07", mode: "Elevated Hydraulic Load", time: "2h ago", severity: "info" as const }
  ];

  // Today's Maintenance Tasks
  const todayTasks = [
    { time: "09:00", asset: "CAT D11 #07", task: "Hydraulic Fluid Top-up", tech: "John Doe", status: "completed" },
    { time: "14:00", asset: "CAT 797F #01", task: "Vibration Test & Bearing Lube", tech: "Alex Smith", status: "scheduled" }
  ];

  // Site-specific Predictions (from FastAPI AI service schema mapping)
  const predictions = [
    { asset: "CAT 797F #01", failureMode: "Bearing Failure", probability: "64%", rul: "48 operating hours", action: "Perform alignment test" },
    { asset: "CAT D11 #07", failureMode: "Hydraulic Failure", probability: "12%", rul: "620 operating hours", action: "Standard inspection cycle" }
  ];

  // Technician Status
  const technicians = [
    { name: "Alex Smith", role: "Maintenance Lead", status: "active" as const, task: "CAT 797F #01 Repair" },
    { name: "John Doe", role: "Mechanical Specialist", status: "available" as const, task: "Idle / Standby" },
    { name: "Brad Pitt", role: "Electrical Inspector", status: "available" as const, task: "Idle / Standby" },
    { name: "David Miller", role: "Hydraulics Engineer", status: "offsite" as const, task: "Standby Duty" }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Site Header Summary */}
      <Card className="p-4 bg-[#FFFBEB]/50 dark:bg-stone-950/20 border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCD00]">Assigned Facility Profile</span>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">{assignedSite.name}</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-stone-500 font-semibold block">Facility Supervisor:</span>
            <span className="font-bold">{assignedSite.manager}</span>
          </div>
          <div>
            <span className="text-stone-500 font-semibold block">Site Coordinates:</span>
            <span className="font-bold">{assignedSite.location}</span>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 border-stone-200 dark:border-stone-800 hover:border-[#FFCD00] transition-colors">
            <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">{stat.label}</h4>
            <div className={`text-2xl font-extrabold tracking-tight mt-1.5 ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-[10px] text-stone-400 mt-1">{stat.trend}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Machine List & Predictions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Machine List Grid */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Facility Machine Registry</CardTitle>
                <CardDescription>Telemetry statuses of PSG CAS assets</CardDescription>
              </div>
              <Badge variant="neutral">Assets: {psgCasMachines.length}</Badge>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <th className="py-3 px-5">Machinery</th>
                    <th className="py-3 px-5">Serial Tag</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right font-semibold">Health Score</th>
                    <th className="py-3 px-5 text-right font-semibold">Vibe (mm/s)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {psgCasMachines.map((m) => (
                    <tr key={m.serial} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/25 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-stone-900 dark:text-stone-100">
                        <div className="flex items-center gap-2">
                          <span>{m.name}</span>
                          {((m.status as string) === "warning" || (m.status as string) === "critical") && (
                            <button
                              type="button"
                              onClick={() => handleMessageClick(m.name, assignedSite.name, m.status)}
                              title="Message Admin"
                              className="text-stone-500 hover:text-[#FFCD00] transition-colors cursor-pointer text-[10px]"
                            >
                              💬
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-stone-500 dark:text-stone-400">{m.serial}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex justify-center">
                          <Badge variant={m.status === "operational" ? "success" : "warning"}>
                            {m.status}
                          </Badge>
                        </div>
                      </td>
                      <td className={`py-3.5 px-5 text-right font-extrabold ${
                        m.health > 85 ? "text-emerald-500" : "text-amber-500"
                      }`}>{m.health}%</td>
                      <td className="py-3.5 px-5 text-right font-semibold text-stone-700 dark:text-stone-400">{m.vibration} mm/s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Predictions Forecasting */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">FastAPI AI Failure Predictions</h3>
            <div className="space-y-4">
              {predictions.map((p, i) => (
                <div key={i} className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-50">{p.asset}</span>
                      <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-extrabold">{p.failureMode} Risk</span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">RUL forecast: <strong>{p.rul}</strong></span>
                  </div>
                  <div className="flex items-center gap-6 text-right md:text-left justify-between md:justify-end">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Failure Likelihood:</span>
                      <span className="text-red-500 font-extrabold text-sm">{p.probability}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">Prescribed Action:</span>
                      <span className="text-[#FFCD00] font-bold text-xs uppercase tracking-wider block">{p.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right 1 Column: Alerts, Today's Maintenance, Technician status */}
        <div className="space-y-6">
          
          {/* Site-Specific Alerts */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Facility Alarms</h3>
            <div className="space-y-3">
              {siteAlerts.map((alert, i) => (
                <div key={i} className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-300 dark:border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-50 block">{alert.asset}</span>
                    <span className="text-[10px] text-amber-500 font-bold uppercase block mt-0.5">{alert.mode}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={alert.severity === "warning" ? "warning" : "neutral"}>
                      {alert.severity}
                    </Badge>
                    <span className="text-[9px] text-stone-500 block mt-1 font-mono">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Today's Maintenance Tasks */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Today's Service schedule</h3>
            <div className="space-y-3">
              {todayTasks.map((t, i) => (
                <div key={i} className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-300 dark:border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#FFCD00] font-mono">{t.time}</span>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-50">{t.asset}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">{t.task}</span>
                    <span className="text-[9px] text-stone-400 mt-0.5 block">Tech: {t.tech}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-[10px] font-bold uppercase ${
                      t.status === "completed" ? "text-emerald-500" : "text-amber-500"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Technician Status List */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Technician Deployment</h3>
            <div className="space-y-3">
              {technicians.map((tech) => (
                <div key={tech.name} className="flex items-center justify-between p-2 rounded border border-stone-200 dark:border-stone-800/80 bg-stone-50/50 dark:bg-[#FFFBEB]/50 dark:bg-stone-950/20">
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">{tech.name}</span>
                    <span className="text-[10px] text-stone-500 block">{tech.role}</span>
                    <span className="text-[9px] text-[#FFCD00] block mt-0.5 font-bold truncate max-w-[150px]">Task: {tech.task}</span>
                  </div>
                  <div className="shrink-0">
                    <span className={`w-2 h-2 rounded-full inline-block ${
                      tech.status === "active" 
                        ? "bg-amber-500 animate-pulse" 
                        : tech.status === "available" 
                        ? "bg-emerald-500" 
                        : "bg-stone-500"
                    }`} title={tech.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
