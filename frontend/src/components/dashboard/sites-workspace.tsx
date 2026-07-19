import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Interfaces
interface Site {
  id: string;
  name: string;
  supervisor: string;
  totalMachines: number;
  onlineMachines: number;
  offlineMachines: number;
  health: number;
  status: "nominal" | "warning" | "critical";
  activeAlerts: number;
  openMaintenance: number;
  lastUpdated: string;
  location: string;
}

interface Machine {
  name: string;
  serial: string;
  status: "operational" | "warning" | "critical";
  health: number;
  temp: number;
  vibration: number;
}

interface Alert {
  asset: string;
  mode: string;
  time: string;
  severity: "critical" | "warning" | "info";
}

interface Task {
  time: string;
  asset: string;
  task: string;
  tech: string;
  status: "completed" | "scheduled";
}

// Complete mock database details for Level 2 Site dashboards
const siteMachinesData: Record<string, Machine[]> = {
  "site-1": [
    { name: "CAT 797F Mining Truck #01", serial: "CAT-797F-PE01", status: "warning", health: 74.5, temp: 78.2, vibration: 3.1 },
    { name: "CAT 320 Excavator #03", serial: "CAT-320-PE03", status: "operational", health: 96.2, temp: 64.1, vibration: 1.2 },
    { name: "CAT D11 Track Dozer #07", serial: "CAT-D11-PE07", status: "operational", health: 92.0, temp: 69.5, vibration: 1.8 },
    { name: "CAT 988 Wheel Loader #02", serial: "CAT-988-PE02", status: "operational", health: 98.4, temp: 61.3, vibration: 0.95 },
    { name: "CAT CB10 Utility Roller #04", serial: "CAT-CB10-PE04", status: "operational", health: 95.9, temp: 63.8, vibration: 1.05 }
  ],
  "site-2": [
    { name: "CAT 320 Excavator #52", serial: "CAT-320-DE52", status: "warning", health: 79.1, temp: 77.8, vibration: 2.8 },
    { name: "CAT D11 Track Dozer #18", serial: "CAT-D11-DE18", status: "warning", health: 81.4, temp: 74.2, vibration: 2.5 },
    { name: "CAT 797F Mining Truck #08", serial: "CAT-797F-DE08", status: "operational", health: 93.8, temp: 67.2, vibration: 1.3 },
    { name: "CAT CB10 Utility Roller #11", serial: "CAT-CB10-DE11", status: "operational", health: 91.0, temp: 69.0, vibration: 1.6 }
  ],
  "site-3": [
    { name: "CAT 797F Mining Truck #12", serial: "CAT-797F-AU12", status: "operational", health: 94.0, temp: 68.0, vibration: 1.4 },
    { name: "CAT 320 Excavator #19", serial: "CAT-320-AU19", status: "operational", health: 95.1, temp: 65.5, vibration: 1.1 },
    { name: "CAT CB10 Utility Roller #15", serial: "CAT-CB10-AU15", status: "operational", health: 97.2, temp: 62.0, vibration: 0.8 }
  ],
  "site-4": [
    { name: "CAT 988 Wheel Loader #09", serial: "CAT-988-TU09", status: "critical", health: 42.0, temp: 96.5, vibration: 5.2 },
    { name: "CAT D11 Track Dozer #15", serial: "CAT-D11-TU15", status: "operational", health: 91.5, temp: 68.8, vibration: 1.5 },
    { name: "CAT 797F Mining Truck #05", serial: "CAT-797F-TU05", status: "operational", health: 93.0, temp: 67.5, vibration: 1.2 }
  ]
};

const siteAlertsData: Record<string, Alert[]> = {
  "site-1": [
    { asset: "CAT 797F #01", mode: "Bearing Vibration Spike", time: "15m ago", severity: "warning" },
    { asset: "CAT D11 #07", mode: "Elevated Hydraulic Load", time: "2h ago", severity: "info" }
  ],
  "site-2": [
    { asset: "CAT 320 #52", mode: "Hydraulic System Leak", time: "2h ago", severity: "warning" },
    { asset: "CAT D11 #18", mode: "Radiator Heat Rise", time: "44m ago", severity: "warning" }
  ],
  "site-3": [],
  "site-4": [
    { asset: "CAT 988 #09", mode: "Engine System Overheat", time: "4h ago", severity: "critical" }
  ]
};

const siteTasksData: Record<string, Task[]> = {
  "site-1": [
    { time: "09:00", asset: "CAT D11 #07", task: "Hydraulic Fluid Top-up", tech: "John Doe", status: "completed" },
    { time: "14:00", asset: "CAT 797F #01", task: "Vibration Test & Bearing Lube", tech: "Alex Smith", status: "scheduled" }
  ],
  "site-2": [
    { time: "10:30", asset: "CAT 320 #52", task: "Seal Replacement & Inspection", tech: "Maria Lopez", status: "scheduled" },
    { time: "11:15", asset: "CAT D11 #18", task: "Hose Leak Replacement Check", tech: "Brad Pitt", status: "scheduled" }
  ],
  "site-3": [
    { time: "08:00", asset: "CAT CB10 #15", task: "Alternator Calibration", tech: "David Miller", status: "completed" }
  ],
  "site-4": [
    { time: "13:00", asset: "CAT 988 #09", task: "Cooling Core Swap", tech: "Elena Rostova", status: "scheduled" }
  ]
};

interface SitesWorkspaceProps {
  onTriggerMessage?: (managerId: string, context: string, body: string) => void;
}

export const SitesWorkspace: React.FC<SitesWorkspaceProps> = ({ onTriggerMessage }) => {
  const getManagerEmailForSite = (siteName: string): string => {
    const norm = siteName.toLowerCase();
    if (norm.includes("psg")) return "manager.psg@cat.com";
    if (norm.includes("decatur")) return "manager.decatur@cat.com";
    if (norm.includes("aurora")) return "manager.aurora@cat.com";
    if (norm.includes("tucson")) return "manager.tucson@cat.com";
    return "manager.psg@cat.com";
  };

  const handleMessageClick = (machineCode: string, siteName: string, severity: string) => {
    if (onTriggerMessage) {
      const managerEmail = getManagerEmailForSite(siteName);
      onTriggerMessage(
        managerEmail,
        `Regarding ${machineCode.replace("CAT ", "CAT")} - ${severity.toUpperCase()} Alert`,
        `Can you provide an update on why this machine is still in a ${severity} state?`
      );
    }
  };
  // Enriched sites dataset
  const sites: Site[] = [
    {
      id: "site-1",
      name: "PSG CAS Site",
      supervisor: "Mark Vance",
      totalMachines: 45,
      onlineMachines: 45,
      offlineMachines: 0,
      health: 91.4,
      status: "nominal",
      activeAlerts: 2,
      openMaintenance: 1,
      lastUpdated: "2 min ago",
      location: "PSG CAS, India"
    },
    {
      id: "site-2",
      name: "Decatur Facility",
      supervisor: "Sarah Jenkins",
      totalMachines: 30,
      onlineMachines: 28,
      offlineMachines: 2,
      health: 86.2,
      status: "warning",
      activeAlerts: 4,
      openMaintenance: 2,
      lastUpdated: "5 min ago",
      location: "Decatur, IL"
    },
    {
      id: "site-3",
      name: "Aurora Factory",
      supervisor: "Dave Miller",
      totalMachines: 20,
      onlineMachines: 20,
      offlineMachines: 0,
      health: 88.8,
      status: "nominal",
      activeAlerts: 0,
      openMaintenance: 0,
      lastUpdated: "12 min ago",
      location: "Aurora, CO"
    },
    {
      id: "site-4",
      name: "Tucson Proving Ground",
      supervisor: "Elena Rostova",
      totalMachines: 10,
      onlineMachines: 9,
      offlineMachines: 1,
      health: 94.0,
      status: "critical",
      activeAlerts: 3,
      openMaintenance: 1,
      lastUpdated: "1 min ago",
      location: "Tucson, AZ"
    }
  ];

  // State Management
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("health-desc");

  // Selected site data resolver
  const selectedSite = useMemo(() => {
    return sites.find(s => s.id === selectedSiteId) || null;
  }, [selectedSiteId]);

  // Filters calculation for Level 1 overview
  const filteredSites = useMemo(() => {
    let result = [...sites];

    // Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.supervisor.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter);
    }

    // Health filter
    if (healthFilter !== "all") {
      if (healthFilter === "high") {
        result = result.filter(s => s.health >= 90);
      } else if (healthFilter === "medium") {
        result = result.filter(s => s.health >= 80 && s.health < 90);
      } else if (healthFilter === "low") {
        result = result.filter(s => s.health < 80);
      }
    }

    // Sort By
    if (sortBy === "health-desc") {
      result.sort((a, b) => b.health - a.health);
    } else if (sortBy === "health-asc") {
      result.sort((a, b) => a.health - b.health);
    } else if (sortBy === "machines-desc") {
      result.sort((a, b) => b.totalMachines - a.totalMachines);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, statusFilter, healthFilter, sortBy]);

  // Render health percentage color badge helper
  const getHealthBadgeColor = (health: number) => {
    if (health >= 90) return "success";
    if (health >= 80) return "warning";
    return "danger";
  };

  // Render status badge helper
  const getStatusBadgeVariant = (status: "nominal" | "warning" | "critical") => {
    if (status === "nominal") return "success";
    if (status === "warning") return "warning";
    return "danger";
  };

  // If a site is selected, render LEVEL 2 (Site detailed dashboard view)
  if (selectedSite) {
    const machines = siteMachinesData[selectedSite.id] || [];
    const alerts = siteAlertsData[selectedSite.id] || [];
    const tasks = siteTasksData[selectedSite.id] || [];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Back navigation strip */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSiteId(null)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-250 transition-colors uppercase font-bold tracking-wider"
          >
            ← Back to Global Sites Overview
          </button>
          <Badge variant={getStatusBadgeVariant(selectedSite.status)}>
            Site Status: {selectedSite.status}
          </Badge>
        </div>

        {/* Detailed Site Header */}
        <Card className="p-5 border-stone-200 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCD00]">Facility Dashboard</span>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">{selectedSite.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{selectedSite.location}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-xs border-l border-stone-200 dark:border-stone-800 pl-6">
              <div>
                <span className="text-stone-500 font-semibold block uppercase text-[10px]">Supervisor</span>
                <span className="font-extrabold text-stone-800 dark:text-stone-200">{selectedSite.supervisor}</span>
              </div>
              <div>
                <span className="text-stone-500 font-semibold block uppercase text-[10px]">Average Health</span>
                <span className={`font-extrabold ${
                  selectedSite.health >= 90 ? "text-emerald-500" : selectedSite.health >= 80 ? "text-amber-500" : "text-red-500"
                }`}>{selectedSite.health}%</span>
              </div>
              <div>
                <span className="text-stone-500 font-semibold block uppercase text-[10px]">Last Updated</span>
                <span className="font-mono text-stone-500">{selectedSite.lastUpdated}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-stone-200 dark:border-stone-800">
            <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Total Machinery</h4>
            <div className="text-2xl font-extrabold tracking-tight mt-1.5 text-stone-900 dark:text-stone-50">
              {selectedSite.totalMachines} Assets
            </div>
            <p className="text-[10px] text-stone-400 mt-1">{selectedSite.onlineMachines} online / {selectedSite.offlineMachines} offline</p>
          </Card>

          <Card className="p-4 border-stone-200 dark:border-stone-800">
            <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Active Alerts</h4>
            <div className="text-2xl font-extrabold tracking-tight mt-1.5 text-stone-900 dark:text-stone-50">
              {selectedSite.activeAlerts} Issues
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Requires supervisor inspection</p>
          </Card>

          <Card className="p-4 border-stone-200 dark:border-stone-800">
            <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Open Maintenance</h4>
            <div className="text-2xl font-extrabold tracking-tight mt-1.5 text-stone-900 dark:text-stone-50">
              {selectedSite.openMaintenance} Tasks
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Assigned to tech teams</p>
          </Card>

          <Card className="p-4 border-stone-200 dark:border-stone-800">
            <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Online Ratio</h4>
            <div className="text-2xl font-extrabold tracking-tight mt-1.5 text-emerald-500">
              {((selectedSite.onlineMachines / selectedSite.totalMachines) * 100).toFixed(1)}%
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Operational connectivity index</p>
          </Card>
        </div>

        {/* Level 2 Subsections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Machines list (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle>Site Machinery Registry</CardTitle>
                <CardDescription>Telemetry statuses of active local assets</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 font-bold border-b border-stone-200 dark:border-stone-800 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Machine Name</th>
                        <th className="p-4">Serial Number</th>
                        <th className="p-4 text-center">Health Index</th>
                        <th className="p-4 text-center">Temperature</th>
                        <th className="p-4 text-center">Vibration</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                      {machines.map((m, i) => (
                        <tr key={i} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/10">
                          <td className="p-4 font-bold text-stone-800 dark:text-stone-200">
                            <div className="flex items-center gap-2">
                              <span>{m.name}</span>
                              {(m.status === "warning" || m.status === "critical") && (
                                <button
                                  type="button"
                                  onClick={() => handleMessageClick(m.name, selectedSite.name, m.status)}
                                  title="Message Site Manager"
                                  className="text-stone-500 hover:text-[#FFCD00] transition-colors cursor-pointer text-[10px]"
                                >
                                  💬
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-mono text-stone-500">{m.serial}</td>
                          <td className="p-4 text-center">
                            <span className={`font-mono font-bold ${
                              m.health >= 90 ? "text-emerald-500" : m.health >= 70 ? "text-amber-500" : "text-red-500"
                            }`}>{m.health}%</span>
                          </td>
                          <td className="p-4 text-center font-mono">{m.temp}°C</td>
                          <td className="p-4 text-center font-mono">{m.vibration} mm/s</td>
                          <td className="p-4 text-right">
                            <Badge variant={m.status === "operational" ? "success" : m.status === "warning" ? "warning" : "danger"}>
                              {m.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Panel: Active Alerts and Maintenance */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <Card className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-stone-500">Active Site Alerts</h3>
              {alerts.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No active alerts recorded.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((al, i) => (
                    <div key={i} className="text-xs p-3 bg-stone-50 dark:bg-stone-900/60 rounded border border-stone-200 dark:border-stone-850 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-stone-800 dark:text-stone-200">{al.asset}</span>
                        <Badge variant={al.severity === "critical" ? "danger" : al.severity === "warning" ? "warning" : "info"}>
                          {al.severity}
                        </Badge>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 font-bold">{al.mode}</p>
                      <span className="text-[9px] text-stone-400 font-mono">{al.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Today's Maintenance Tasks */}
            <Card className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-stone-500">Today's Work Orders</h3>
              {tasks.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No maintenance tasks scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((ts, i) => (
                    <div key={i} className="text-xs space-y-1 pb-3 border-b last:border-0 border-stone-200 dark:border-stone-800 last:pb-0">
                      <div className="flex justify-between font-bold">
                        <span className="text-stone-800 dark:text-stone-250">{ts.asset}</span>
                        <span className="text-stone-500 font-mono">{ts.time}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">{ts.task}</p>
                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="text-stone-450">Tech: {ts.tech}</span>
                        <Badge variant={ts.status === "completed" ? "success" : "neutral"}>
                          {ts.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // LEVEL 1: Overview Grid of all sites
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Workspace Subtitle */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCD00]">Super Admin Controls</span>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">Global Site Fleet Workspace</h2>
        <p className="text-xs text-stone-500 mt-1">Monitor operational metrics and open detailed local dashboards.</p>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4 border-stone-200 dark:border-stone-800/80">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Site Name or Supervisor..."
            className="text-xs bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-md px-3 py-2 font-bold uppercase placeholder-stone-500 focus:outline-none focus:border-[#FFCD00] transition-colors flex-1"
          />

          <div className="flex flex-wrap gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-md px-3 py-2 font-bold uppercase cursor-pointer hover:border-stone-400 dark:hover:border-stone-700 focus:outline-none transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="nominal">Nominal Only</option>
              <option value="warning">Warning Only</option>
              <option value="critical">Critical Only</option>
            </select>

            {/* Health Filter */}
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="text-xs bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-md px-3 py-2 font-bold uppercase cursor-pointer hover:border-stone-400 dark:hover:border-stone-700 focus:outline-none transition-colors"
            >
              <option value="all">All Health Ranges</option>
              <option value="high">High Health (&ge;90%)</option>
              <option value="medium">Medium Health (80%-90%)</option>
              <option value="low">Low Health (&lt;80%)</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-md px-3 py-2 font-bold uppercase cursor-pointer hover:border-stone-400 dark:hover:border-stone-700 focus:outline-none transition-colors"
            >
              <option value="health-desc">Health: High to Low</option>
              <option value="health-asc">Health: Low to High</option>
              <option value="machines-desc">Machines: High to Low</option>
              <option value="name-asc">Site Name: A-Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Site Cards */}
      {filteredSites.length === 0 ? (
        <div className="text-center py-12 bg-stone-50/20 dark:bg-stone-950/10 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 p-6">
          <h4 className="text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
            No sites match the current filters
          </h4>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-sm mx-auto normal-case">
            Adjust your search query or remove active status and health range filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSites.map((site) => (
            <Card
              key={site.id}
              onClick={() => setSelectedSiteId(site.id)}
              className="group border-stone-200 dark:border-stone-800 hover:border-[#FFCD00] dark:hover:border-[#FFCD00]/80 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4 flex-1">
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide group-hover:text-[#FFCD00] transition-colors">
                      {site.name}
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-0.5 font-bold uppercase">Location: {site.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(site.status)}>
                      {site.status}
                    </Badge>
                  </div>
                </div>

                {/* Supervisor detail */}
                <div className="text-xs text-stone-500">
                  Supervisor: <span className="font-bold text-stone-700 dark:text-stone-300">{site.supervisor}</span>
                </div>

                {/* Machine Statistics Panel */}
                <div className="grid grid-cols-3 gap-2 bg-stone-50 dark:bg-stone-950/40 p-3 rounded border border-stone-200/50 dark:border-stone-800 text-center">
                  <div>
                    <span className="text-[8px] text-stone-400 uppercase font-bold block">Total Assets</span>
                    <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 font-mono">{site.totalMachines}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-stone-400 uppercase font-bold block">Online</span>
                    <span className="text-xs font-extrabold text-emerald-500 font-mono">{site.onlineMachines}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-stone-400 uppercase font-bold block">Offline</span>
                    <span className="text-xs font-extrabold text-stone-500 font-mono">{site.offlineMachines}</span>
                  </div>
                </div>

                {/* Dynamic Health Index Display */}
                <div className="flex items-center justify-between border-t border-stone-200/80 dark:border-stone-850/50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 uppercase font-bold">Health Index:</span>
                    <span className={`text-xs font-mono font-extrabold ${
                      site.health >= 90 ? "text-emerald-500" : site.health >= 80 ? "text-amber-500" : "text-red-500"
                    }`}>
                      {site.health}%
                    </span>
                  </div>
                  <Badge variant={getHealthBadgeColor(site.health)}>
                    {site.health >= 90 ? "Optimal" : site.health >= 80 ? "Degraded" : "Critical"}
                  </Badge>
                </div>

                {/* Alerts and Maintenance parameters */}
                <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold pt-1">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <span className={`w-1.5 h-1.5 rounded-full ${site.activeAlerts > 0 ? "bg-red-500 animate-ping" : "bg-stone-400"}`} />
                    Active Alerts: <span className="font-extrabold text-stone-700 dark:text-stone-300">{site.activeAlerts}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Pending Work: <span className="font-extrabold text-stone-700 dark:text-stone-300">{site.openMaintenance}</span>
                  </div>
                </div>

                {/* Footer timestamp */}
                <div className="text-[9px] font-mono text-stone-400 dark:text-stone-500 text-right pt-1">
                  Updated {site.lastUpdated}
                </div>
              </CardContent>

              {/* Action Button at bottom */}
              <div className="p-4 pt-0 border-t border-stone-100 dark:border-stone-850/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSiteId(site.id);
                  }}
                  className="bg-[#FFCD00] hover:bg-[#E6B800] text-black font-extrabold uppercase text-[10px] tracking-wider py-2 px-4 rounded w-full flex items-center justify-center gap-1 transition-colors"
                >
                  Open Dashboard &rarr;
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
