import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServiceRequest {
  id: string;
  asset: string;
  serial: string;
  site: string;
  problem: string;
  status: "pending" | "in-progress" | "resolved";
  partsReplaced: string[];
  reportUploaded: string | null;
}

export const ServiceTeamDashboard: React.FC = () => {
  // Service Team context
  const teamName = "Service Team Alpha";

  // State for Service Requests
  const [requests, setRequests] = useState<ServiceRequest[]>([
    {
      id: "SR-812",
      asset: "CAT 320 Excavator #03",
      serial: "CAT-320-PE03",
      site: "PSG CAS",
      problem: "Hydraulic sensor calibration drift. Output voltage fluctuating outside 4-20mA range.",
      status: "in-progress",
      partsReplaced: [],
      reportUploaded: null
    },
    {
      id: "SR-819",
      asset: "CAT 797F Mining Truck #01",
      serial: "CAT-797F-PE01",
      site: "PSG CAS",
      problem: "Fuel injector filter blockage check and flushing.",
      status: "pending",
      partsReplaced: [],
      reportUploaded: null
    }
  ]);

  // State for Repair History
  const [history, setHistory] = useState([
    { id: "SR-790", asset: "CAT D11 Dozer #07", site: "PSG CAS", taskName: "Hydraulic Pump Gasket Replacement", date: "3 days ago", parts: ["Pump Gasket Seal", "Hydraulic Fluid"] },
    { id: "SR-782", asset: "CAT CB10 Roller #04", site: "Decatur Facility", taskName: "Alternator Output Recalibration", date: "Last week", parts: ["Voltage Regulator Pin"] }
  ]);

  // Selected Service Request
  const [selectedRequestId, setSelectedRequestId] = useState<string>("SR-812");
  const [newPartName, setNewPartName] = useState("");
  const [partsList, setPartsList] = useState<string[]>([]);
  const [reportFileName, setReportFileName] = useState<string | null>(null);
  const [reportUploading, setReportUploading] = useState<number | null>(null);

  const activeRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  // Assigned Sites list
  const assignedSites = [
    { name: "PSG CAS", location: "PSG CAS, India", machinesCount: 45, status: "Active Support" },
    { name: "Decatur Facility", location: "Decatur, IL", machinesCount: 30, status: "On-Call Support" }
  ];

  // Assigned Machines covered by team
  const coveredMachines = [
    { name: "CAT 320 Excavator #03", site: "PSG CAS", health: "96.2%", status: "nominal" },
    { name: "CAT 797F Mining Truck #01", site: "PSG CAS", health: "74.5%", status: "warning" },
    { name: "CAT CB10 Roller #04", site: "Decatur", health: "95.9%", status: "nominal" }
  ];

  // Add Part tag to list
  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    setPartsList([...partsList, newPartName.trim()]);
    setNewPartName("");
  };

  // Upload report file simulation
  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setReportUploading(0);
    const interval = setInterval(() => {
      setReportUploading((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setReportFileName(file.name);
          setReportUploading(null);
          return null;
        }
        return prev + 20;
      });
    }, 120);
  };

  // Mark machine repaired
  const handleMarkRepaired = () => {
    // Update active request
    setRequests((prevRequests) =>
      prevRequests.map((r) =>
        r.id === activeRequest.id
          ? { ...r, status: "resolved", partsReplaced: partsList, reportUploaded: reportFileName }
          : r
      )
    );

    // Push into repair history
    setHistory((prevHistory) => [
      {
        id: activeRequest.id,
        asset: activeRequest.asset,
        site: activeRequest.site,
        taskName: activeRequest.problem.split(".")[0],
        date: "Just now",
        parts: partsList.length > 0 ? partsList : ["None replaced"]
      },
      ...prevHistory
    ]);

    // Reset inputs
    setPartsList([]);
    setReportFileName(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Info */}
      <Card className="p-4 bg-[#FFFBEB]/50 dark:bg-stone-950/20 border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCD00]">Service Operations Console</span>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">{teamName} Workspace</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-stone-500 font-semibold block">Covered Facilities:</span>
            <span className="font-bold">PSG CAS, Decatur</span>
          </div>
          <div>
            <span className="text-stone-500 font-semibold block">Dispatch Status:</span>
            <span className="text-emerald-500 font-bold uppercase animate-pulse">Ready for Dispatch</span>
          </div>
        </div>
      </Card>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Selected request actions, Service Request lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Service Actions Box */}
          {activeRequest && (
            <Card className="p-5 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 font-bold block">{activeRequest.id} ({activeRequest.site})</span>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide mt-0.5">{activeRequest.asset} Service</h3>
                </div>
                <Badge variant={activeRequest.status === "resolved" ? "success" : "warning"}>
                  {activeRequest.status}
                </Badge>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <div>
                  <span className="text-stone-500 font-bold block mb-1">Issue Reported:</span>
                  <p className="p-3 bg-stone-50 dark:bg-stone-950/70 border border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400 leading-5 rounded">
                    {activeRequest.problem}
                  </p>
                </div>

                {/* Upload Service Report */}
                <div className="space-y-1.5">
                  <span className="text-stone-500 font-bold block">Upload Calibration & Service Report</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border border-dashed border-stone-400 dark:border-stone-800/80 rounded py-3 px-4 text-center bg-stone-50/50 dark:bg-[#FFFBEB]/50 dark:bg-stone-950/20 relative overflow-hidden flex items-center justify-center gap-2">
                      <input
                        type="file"
                        onChange={handleReportUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={reportUploading !== null}
                      />
                      <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[10px] text-stone-500 font-bold">
                        {reportFileName ? reportFileName : "SELECT CALIBRATION REPORT"}
                      </span>

                      {/* Progress bar overlay */}
                      {reportUploading !== null && (
                        <div className="absolute inset-0 bg-stone-950/80 flex items-center justify-center">
                          <span className="text-[9px] text-[#FFCD00] font-mono">Uploading Report: {reportUploading}%</span>
                        </div>
                      )}
                    </div>
                    {reportFileName && (
                      <Button variant="ghost" className="text-red-500 hover:text-red-400 py-1" onClick={() => setReportFileName(null)}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Parts Replaced Dynamic List Builder */}
                <div className="space-y-2">
                  <span className="text-stone-500 font-bold block">Upload Parts Replaced</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Hydraulic pressure sensor pin"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      className="flex-1 py-1.5"
                    />
                    <Button variant="outline" type="button" className="px-3" onClick={handleAddPart}>
                      Add Part
                    </Button>
                  </div>

                  {/* Render parts badges */}
                  {partsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 dark:bg-stone-950 rounded border border-stone-300 dark:border-stone-800 mt-2">
                      {partsList.map((part, i) => (
                        <Badge key={i} variant="warning" className="normal-case font-bold flex items-center gap-1.5">
                          <span>{part}</span>
                          <button
                            type="button"
                            onClick={() => setPartsList(partsList.filter((_, idx) => idx !== i))}
                            className="hover:text-red-500 font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
                <Button
                  variant="primary"
                  onClick={handleMarkRepaired}
                  disabled={activeRequest.status === "resolved"}
                  className="w-full sm:w-fit"
                >
                  Mark Machine Repaired
                </Button>
              </div>
            </Card>
          )}

          {/* Service Requests Table */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Assigned Site Service Tickets</CardTitle>
              <CardDescription>Open requests requiring sensor checks and gasket adjustments</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <th className="py-3 px-5">Ticket ID</th>
                    <th className="py-3 px-5">Asset Model</th>
                    <th className="py-3 px-5">Facility Location</th>
                    <th className="py-3 px-5">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRequestId(r.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedRequestId === r.id
                          ? "bg-[#FFCD00]/5 dark:bg-[#FFCD00]/5 hover:bg-[#FFCD00]/10"
                          : "hover:bg-stone-50/50 dark:hover:bg-stone-800/20"
                      }`}
                    >
                      <td className="py-3.5 px-5 font-bold">{r.id}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-stone-900 dark:text-stone-50 block">{r.asset}</span>
                        <span className="text-[10px] text-stone-500 mt-0.5 block truncate max-w-xs">{r.problem}</span>
                      </td>
                      <td className="py-3.5 px-5 text-stone-600 dark:text-stone-400">{r.site}</td>
                      <td className="py-3.5 px-5">
                        <Badge variant={r.status === "resolved" ? "success" : "warning"}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

        {/* Right 1 Column: Assigned Sites, Assigned Machines, Repair History */}
        <div className="space-y-6">
          
          {/* Assigned Sites */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Assigned Support Sites</h3>
            <div className="space-y-3">
              {assignedSites.map((site) => (
                <div key={site.name} className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-300 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-50 block">{site.name}</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">{site.location}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="neutral" className="text-[9px] px-1 py-0">{site.status}</Badge>
                    <span className="text-[9px] text-stone-400 block mt-1 font-mono">{site.machinesCount} machines</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Covered Machines list */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Covered Site Machinery</h3>
            <div className="space-y-3">
              {coveredMachines.map((m, i) => (
                <div key={i} className="p-2.5 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-300 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">{m.name}</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5 font-mono">Site: {m.site}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-extrabold block ${
                      m.status === "warning" ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {m.health}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Repair History list */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Service Repair History</h3>
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="text-xs space-y-1 pb-3 last:pb-0 border-b last:border-0 border-stone-200 dark:border-stone-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-stone-900 dark:text-stone-100">{h.asset}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{h.date}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-4">{h.taskName}</p>
                  
                  {/* Replaced Parts badges inside history */}
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {h.parts.map((p, idx) => (
                      <span key={idx} className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-1.5 py-0.5 text-[9px] text-stone-500 font-semibold font-mono">
                        {p}
                      </span>
                    ))}
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
