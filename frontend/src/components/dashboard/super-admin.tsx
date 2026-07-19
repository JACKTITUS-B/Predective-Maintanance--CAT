import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SuperAdminDashboard: React.FC = () => {
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");
  const [siteFilter, setSiteFilter] = React.useState<string>("all");

  // Maintenance Section States
  const [activeMaintenanceTab, setActiveMaintenanceTab] = React.useState<"complete" | "inProgress">("complete");
  const [maintenanceSearch, setMaintenanceSearch] = React.useState<string>("");
  const [maintenanceSort, setMaintenanceSort] = React.useState<string>("newest");
  const [maintenanceCostSort, setMaintenanceCostSort] = React.useState<string>("none");

  // Mock statistics data
  const stats = [
    { label: "Total Sites", value: "04", trend: "PSG CAS, Decatur, Aurora, Tucson", color: "text-[#FFCD00]" },
    { label: "Total Fleet Machines", value: "105", trend: "+12 added this Qtr", color: "text-stone-100" },
    { label: "Healthy Assets", value: "92", trend: "87.6% of fleet", color: "text-emerald-500" },
    { label: "Warnings Active", value: "10", trend: "Requires inspection", color: "text-amber-500" },
    { label: "Critical Shutdowns", value: "03", trend: "Immediate attention", color: "text-red-500 animate-pulse" },
    { label: "Predicted Failures", value: "05", trend: "FastAPI ML Forecast", color: "text-[#FFCD00]" },
    { label: "Downtime Saved", value: "420 hrs", trend: "98.2% availability", color: "text-cyan-500" },
    { label: "Cost Savings", value: "$148,200", trend: "Preventive efficiency", color: "text-emerald-400 font-extrabold" }
  ];

  // Mock Machine Distribution per Site
  const machineDist = [
    { site: "PSG CAS", count: 45, percentage: "43%", health: "91.4%" },
    { site: "Decatur Facility", count: 30, percentage: "28%", health: "86.2%" },
    { site: "Aurora Factory", count: 20, percentage: "19%", health: "88.8%" },
    { site: "Tucson Proving Ground", count: 10, percentage: "10%", health: "94.0%" }
  ];

  // Mock Site Overview Details
  const sitesOverview = [
    { name: "PSG CAS", manager: "Mark Vance", activeMachines: "45/45", health: 91.4, status: "nominal" },
    { name: "Decatur Facility", manager: "Sarah Jenkins", activeMachines: "28/30", health: 86.2, status: "warning" },
    { name: "Aurora Factory", manager: "Dave Miller", activeMachines: "20/20", health: 88.8, status: "nominal" },
    { name: "Tucson Proving Ground", manager: "Elena Rostova", activeMachines: "9/10", health: 94.0, status: "critical" }
  ];

  // Mock Recent Alerts
  const recentAlerts = [
    { machine: "CAT 797F #01", site: "PSG CAS", mode: "Bearing Failure", time: "12m ago", severity: "critical" as const },
    { machine: "CAT D11 #18", site: "Aurora", mode: "Cooling Failure", time: "44m ago", severity: "warning" as const },
    { machine: "CAT 320 #52", site: "Decatur", mode: "Hydraulic Leak", time: "2h ago", severity: "warning" as const },
    { machine: "CAT 988 #09", site: "Tucson", mode: "Engine Overheat", time: "4h ago", severity: "critical" as const }
  ];

  // Mock Recent Maintenance Activities
  const recentActivities = [
    { asset: "CAT D11 #04", task: "Radiator Flush & Hose Replacement", engineer: "John Doe", cost: "$1,240", status: "completed", date: "2026-07-18", estCompletion: "" },
    { asset: "CAT 797F #11", task: "Bearing Lubrication & Alignment", engineer: "Alex Smith", cost: "$820", status: "completed", date: "2026-07-17", estCompletion: "" },
    { asset: "CAT 320 #15", task: "Hydraulic Valve Replacement", engineer: "Maria Lopez", cost: "$1,890", status: "scheduled", date: "", estCompletion: "2026-07-20" },
    { asset: "CAT CB10 #02", task: "Battery Replacement & Alternator check", engineer: "Brad Pitt", cost: "$450", status: "completed", date: "2026-07-15", estCompletion: "" }
  ];

  // Fleet Health Trend over last 10 days (SVG path generation)
  const healthTrendData = [88.1, 88.4, 87.9, 88.2, 88.5, 87.6, 88.0, 88.3, 88.1, 88.2];
  const chartWidth = 500;
  const chartHeight = 100;
  const trendPath = healthTrendData
    .map((val, i) => {
      const x = (i / (healthTrendData.length - 1)) * chartWidth;
      // Map health values (85-95%) into chart space
      const y = chartHeight - ((val - 85) / 10) * chartHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const displayedMaintenanceList = React.useMemo(() => {
    // 1. Filter by status based on tab
    let list = recentActivities.filter(act => {
      if (activeMaintenanceTab === "complete") {
        return act.status === "completed";
      } else {
        return act.status !== "completed";
      }
    });
    
    // 2. Filter by search query (normalized spaces)
    if (maintenanceSearch.trim()) {
      const normalizedQuery = maintenanceSearch.replace(/\s+/g, "").toLowerCase();
      list = list.filter(act => {
        const normalizedAsset = act.asset.replace(/\s+/g, "").toLowerCase();
        return normalizedAsset.includes(normalizedQuery);
      });
    }

    // 3. Sort by Cost
    if (maintenanceCostSort === "lowToHigh") {
      list = [...list].sort((a, b) => {
        const valA = parseFloat(a.cost.replace(/[$,]/g, "")) || 0;
        const valB = parseFloat(b.cost.replace(/[$,]/g, "")) || 0;
        return valA - valB;
      });
    } else if (maintenanceCostSort === "highToLow") {
      list = [...list].sort((a, b) => {
        const valA = parseFloat(a.cost.replace(/[$,]/g, "")) || 0;
        const valB = parseFloat(b.cost.replace(/[$,]/g, "")) || 0;
        return valB - valA;
      });
    }

    // 4. Sort by Last Updated (implicit index order)
    if (maintenanceSort === "oldest") {
      list = [...list].reverse();
    }

    return list;
  }, [activeMaintenanceTab, maintenanceSearch, maintenanceSort, maintenanceCostSort]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 relative group hover:border-[#FFCD00] transition-colors border-stone-200 dark:border-stone-800">
            <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">{stat.label}</h4>
            <div className={`text-2xl font-extrabold tracking-tight mt-1.5 ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-[10px] text-stone-400 mt-1">{stat.trend}</p>
          </Card>
        ))}
      </div>

      {/* Row 1: Fleet Health Chart & Recent Maintenance (Machinery Fleet Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Fleet Health trends card */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Fleet-Wide Health & Failure Trends</h3>
                <p className="text-xs text-stone-500 mt-0.5">Average asset health metrics tracked over the last 10 days</p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-stone-400">Current Health Index:</span>
                <span className="text-[#FFCD00] font-extrabold ml-1.5">88.2%</span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="bg-stone-50 dark:bg-stone-950/80 rounded border border-stone-200/50 dark:border-stone-800 p-2 relative overflow-hidden">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-28 overflow-visible">
                {/* Guideline axes */}
                <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="currentColor" className="text-stone-200 dark:text-stone-800/30" strokeWidth="0.5" />
                <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="currentColor" className="text-stone-200 dark:text-stone-800/30" strokeWidth="0.5" />
                <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" className="text-stone-200 dark:text-stone-800/30" strokeWidth="0.5" />
                
                {/* Health line path */}
                <path d={trendPath} fill="none" stroke="#FFCD00" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Plot endpoints */}
                <circle cx={chartWidth} cy={chartHeight - ((healthTrendData[healthTrendData.length - 1] - 85) / 10) * chartHeight} r="4" fill="#FFCD00" className="animate-ping" />
                <circle cx={chartWidth} cy={chartHeight - ((healthTrendData[healthTrendData.length - 1] - 85) / 10) * chartHeight} r="3" fill="#FFCD00" />
              </svg>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono mt-3">
              <span>10 Days Ago (88.1%)</span>
              <span>Today (88.2%)</span>
            </div>
          </Card>
        </div>

        {/* Machinery Fleet Distribution */}
        <div className="lg:col-span-1">
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Machinery Fleet Distribution</h3>
            <div className="space-y-4">
              {machineDist.map((item) => (
                <div key={item.site} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-700 dark:text-stone-300 truncate max-w-[150px]">{item.site}</span>
                    <span className="text-stone-500 font-mono">{item.count} assets ({item.percentage})</span>
                  </div>
                  <div className="bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#FFCD00] h-full rounded-full" style={{ width: item.percentage }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Site Fleet Overview (100% width) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle>Site Fleet overview</CardTitle>
            <CardDescription>Average equipment health and operational thresholds per site</CardDescription>
          </div>
          <Badge variant="neutral">Active Sites: 4</Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                <th className="py-3 px-5">Site Facility</th>
                <th className="py-3 px-5">Site Supervisor</th>
                <th className="py-3 px-5 text-center">Active Machinery</th>
                <th className="py-3 px-5 text-center">Operational Status</th>
                <th className="py-3 px-5 text-right">Avg Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {sitesOverview.map((site) => (
                <tr key={site.name} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/25 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-stone-900 dark:text-stone-100">{site.name}</td>
                  <td className="py-3.5 px-5 text-stone-600 dark:text-stone-400">{site.manager}</td>
                  <td className="py-3.5 px-5 text-center font-mono text-stone-500">{site.activeMachines}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex justify-center">
                      <Badge variant={site.status === "nominal" ? "success" : site.status === "warning" ? "warning" : "danger"}>
                        {site.status}
                      </Badge>
                    </div>
                  </td>
                  <td className={`py-3.5 px-5 text-right font-extrabold ${
                    site.health > 90 ? "text-emerald-500" : site.health > 80 ? "text-amber-500" : "text-red-500"
                  }`}>{site.health}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 3: Critical Fleet Alarms (100% width) */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider">Critical Fleet Alarms</h3>
          
          {/* Dropdown Filters aligned to the right */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-[10px] bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1 font-bold uppercase cursor-pointer hover:border-stone-400 dark:hover:border-stone-700 focus:outline-none transition-colors"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>

            {/* Site Filter */}
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="text-[10px] bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1 font-bold uppercase cursor-pointer hover:border-stone-400 dark:hover:border-stone-700 focus:outline-none transition-colors"
            >
              <option value="all">All Sites</option>
              <option value="PSG CAS">PSG CAS</option>
              <option value="Decatur">Decatur Facility</option>
              <option value="Aurora">Aurora Factory</option>
              <option value="Tucson">Tucson Proving Ground</option>
            </select>
          </div>
        </div>

        {(() => {
          const filteredAlerts = recentAlerts.filter((alert) => {
            const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
            const matchesSite = siteFilter === "all" || alert.site === siteFilter;
            return matchesSeverity && matchesSite;
          });

          return filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs font-bold uppercase tracking-wider bg-stone-50/50 dark:bg-stone-950/20 rounded border border-dashed border-stone-200 dark:border-stone-800">
              No active alarms matching selected filters
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAlerts.map((alert, i) => (
                <div key={i} className="p-4 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-200 dark:border-stone-800/80 flex items-start justify-between gap-4 hover:border-[#FFCD00]/50 transition-colors duration-150">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    {/* Machine Code & Site Name */}
                    <div>
                      <h4 className="text-xs font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-none">
                        {alert.machine.replace("CAT ", "CAT")}
                      </h4>
                      <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 mt-1 block">
                        {alert.site}
                      </span>
                    </div>
                    
                    {/* Failure Type */}
                    <div className="text-[10px] font-bold uppercase text-[#FFCD00] tracking-wider">
                      {alert.mode}
                    </div>
                  </div>

                  {/* Badge & Time on the right */}
                  <div className="flex flex-col items-end justify-between h-full min-h-[52px] shrink-0 text-right">
                    <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>
                      {alert.severity}
                    </Badge>
                    <span className="text-[9px] text-stone-500 font-mono tracking-tight mt-auto pt-1">
                      {alert.time.replace("m ago", " min ago")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </Card>

      {/* Row 4: Single Maintenance Card */}
      <Card className="p-5">
        <div className="flex flex-col gap-4">
          {/* Card Header Title */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">MAINTENANCE</h3>
            <Badge variant="neutral">Items: {displayedMaintenanceList.length}</Badge>
          </div>

          {/* Row of Tabs & Filters */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-3">
            {/* Tabs (Active yellow, inactive dark gray) */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-md border border-stone-200 dark:border-stone-800/80 w-fit shrink-0">
              <button
                type="button"
                onClick={() => setActiveMaintenanceTab("complete")}
                className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-all duration-150 ${
                  activeMaintenanceTab === "complete"
                    ? "bg-[#FFCD00] text-black shadow-sm"
                    : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-250 bg-transparent"
                }`}
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => setActiveMaintenanceTab("inProgress")}
                className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-all duration-150 ${
                  activeMaintenanceTab === "inProgress"
                    ? "bg-[#FFCD00] text-black shadow-sm"
                    : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-250 bg-transparent"
                }`}
              >
                In Progress
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 xl:justify-end">
              {/* Search Machine */}
              <input
                type="text"
                value={maintenanceSearch}
                onChange={(e) => setMaintenanceSearch(e.target.value)}
                placeholder="Search by Machine Code (e.g. CAT D11)..."
                className="text-[10px] bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 font-bold uppercase placeholder-stone-500 focus:outline-none focus:border-[#FFCD00] transition-colors flex-1 sm:max-w-xs"
              />

              <div className="flex gap-2 shrink-0">
                {/* Sort Date */}
                <select
                  value={maintenanceSort}
                  onChange={(e) => setMaintenanceSort(e.target.value)}
                  className="text-[10px] bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 font-bold uppercase cursor-pointer hover:border-stone-400 dark:hover:border-stone-700 focus:outline-none transition-colors"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>

                {/* Sort Cost */}
                <select
                  value={maintenanceCostSort}
                  onChange={(e) => setMaintenanceCostSort(e.target.value)}
                  className="text-[10px] bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 font-bold uppercase cursor-pointer hover:border-stone-400 dark:hover:border-stone-700 focus:outline-none transition-colors"
                >
                  <option value="none">Cost: Default</option>
                  <option value="lowToHigh">Low → High</option>
                  <option value="highToLow">High → Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Content */}
          {displayedMaintenanceList.length === 0 ? (
            <div className="text-center py-10 bg-stone-50/40 dark:bg-stone-950/20 rounded border border-dashed border-stone-200 dark:border-stone-800 p-4">
              <svg className="w-10 h-10 text-stone-300 dark:text-stone-700 mb-3 mx-auto animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                {activeMaintenanceTab === "complete" ? "No completed maintenance found" : "No in-progress maintenance found"}
              </h4>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 max-w-[240px] mx-auto normal-case">
                Adjust your machine search queries or sort values to locate target logs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {displayedMaintenanceList.map((act, i) => (
                <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {/* Machine Code */}
                      <span className="text-[10px] font-extrabold text-stone-900 dark:text-stone-50 bg-stone-100 dark:bg-stone-900/60 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-800">
                        {act.asset.replace("CAT ", "CAT")}
                      </span>
                      {/* Date Details */}
                      <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 font-bold">
                        {activeMaintenanceTab === "complete" 
                          ? `Completed: ${act.date || "2026-07-18"}`
                          : `Est Completion: ${act.estCompletion || "2026-07-20"}`}
                      </span>
                    </div>
                    {/* Maintenance Title */}
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 leading-tight">
                      {act.task}
                    </h4>
                    {/* Engineer */}
                    <p className="text-[10px] text-stone-500">
                      Engineer: <span className="font-bold text-stone-600 dark:text-stone-400">{act.engineer}</span>
                    </p>
                  </div>
                  
                  {/* Right: Cost & Status badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 block">
                        {act.cost}
                      </span>
                    </div>
                    <div>
                      <Badge variant={activeMaintenanceTab === "complete" ? "success" : "warning"}>
                        {activeMaintenanceTab === "complete" ? "COMPLETED" : "IN PROGRESS"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

    </div>
  );
};
