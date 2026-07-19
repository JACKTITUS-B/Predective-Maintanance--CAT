import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Task {
  id: string;
  asset: string;
  serial: string;
  taskName: string;
  priority: "CRITICAL" | "WARNING" | "ROUTINE";
  notes: string;
  status: "scheduled" | "in-progress" | "completed" | "closed";
  images: string[];
}

export const MaintenanceEngineerDashboard: React.FC = () => {
  // Mock Engineer Profile
  const engineerName = "Alex Smith";

  // In-memory Work Orders State
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "WO-9821",
      asset: "CAT 797F Mining Truck #01",
      serial: "CAT-797F-PE01",
      taskName: "Z-Axis Bearing Vibration Overhaul",
      priority: "CRITICAL",
      notes: "Vibration readings exceeded 3.1 mm/s threshold. Replenish grease and test alignment.",
      status: "in-progress",
      images: []
    },
    {
      id: "WO-9825",
      asset: "CAT D11 Track Dozer #07",
      serial: "CAT-D11-PE07",
      taskName: "Radiator Fan Hose Clamp Adjust",
      priority: "ROUTINE",
      notes: "Check coolant leakage warnings and tighten radiator brackets.",
      status: "scheduled",
      images: []
    }
  ]);

  // Completed history
  const [history, setHistory] = useState([
    { id: "WO-9755", asset: "CAT 320 Excavator #03", taskName: "Hydraulic Fluid Flushing", date: "Yesterday", status: "completed" },
    { id: "WO-9740", asset: "CAT 988 Loader #02", taskName: "Alternator Calibration check", date: "2 days ago", status: "completed" }
  ]);

  // State for active task being updated
  const [activeTaskId, setActiveTaskId] = useState<string>("WO-9821");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  // Assigned Site Machines
  const assignedMachines = [
    { name: "CAT 797F Mining Truck #01", serial: "CAT-797F-PE01", health: "74.5%", status: "warning" },
    { name: "CAT D11 Track Dozer #07", serial: "CAT-D11-PE07", health: "92.0%", status: "nominal" },
    { name: "CAT 320 Excavator #03", serial: "CAT-320-PE03", health: "96.2%", status: "nominal" }
  ];

  // Image Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setUploadedFiles((prevFiles) => [...prevFiles, file.name]);
          setUploadProgress(null);
          return null;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Complete / Close Task logic
  const handleTaskStateTransition = (newStatus: "completed" | "closed") => {
    // Update tasks state
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === activeTask.id
          ? { ...t, status: newStatus, notes: inspectionNotes || t.notes, images: [...t.images, ...uploadedFiles] }
          : t
      )
    );

    // If completed or closed, add to history list
    if (newStatus === "completed" || newStatus === "closed") {
      setHistory((prevHistory) => [
        {
          id: activeTask.id,
          asset: activeTask.asset,
          taskName: activeTask.taskName,
          date: "Just now",
          status: newStatus
        },
        ...prevHistory
      ]);
    }

    // Reset inputs
    setInspectionNotes("");
    setUploadedFiles([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Info */}
      <Card className="p-4 bg-[#FFFBEB]/50 dark:bg-stone-950/20 border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCD00]">Maintenance Engineering Console</span>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">Active Work Orders: {engineerName}</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-stone-500 font-semibold block">Supervised Assets:</span>
            <span className="font-bold">06 Machines</span>
          </div>
          <div>
            <span className="text-stone-500 font-semibold block">Scheduled Hours:</span>
            <span className="font-bold">08:00 - 16:00 PSG CAS Shift</span>
          </div>
        </div>
      </Card>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Task list and active update interface */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Work Order Action Box */}
          {activeTask && (
            <Card className="p-5 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 font-bold block">{activeTask.id} ({activeTask.serial})</span>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide mt-0.5">{activeTask.taskName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={activeTask.priority === "CRITICAL" ? "danger" : activeTask.priority === "WARNING" ? "warning" : "neutral"}>
                    {activeTask.priority}
                  </Badge>
                  <Badge variant="warning" className="uppercase font-mono text-[9px]">{activeTask.status}</Badge>
                </div>
              </div>

              {/* Task Details */}
              <div className="py-4 space-y-4 text-xs">
                <div>
                  <span className="text-stone-500 font-bold block mb-1">Standard Work Instructions:</span>
                  <p className="p-3 bg-stone-50 dark:bg-stone-950/70 border border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400 leading-5 rounded">
                    {activeTask.notes}
                  </p>
                </div>

                {/* Inspection Notes Input */}
                <div className="space-y-1.5">
                  <span className="text-stone-500 font-bold block">Engineers Inspection Notes</span>
                  <textarea
                    rows={4}
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    placeholder="Input detailed diagnostic adjustments made, torque limits checked, and vibration metrics verified..."
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded p-3 text-xs focus:outline-none focus:border-[#FFCD00] text-foreground"
                  />
                </div>

                {/* Upload Image Section */}
                <div className="space-y-2">
                  <span className="text-stone-500 font-bold block">Repair Inspection Photos</span>
                  <div className="border border-dashed border-stone-300 dark:border-stone-800 rounded p-4 text-center bg-stone-50/50 dark:bg-stone-950/30 flex flex-col items-center justify-center relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadProgress !== null}
                    />
                    <svg className="w-8 h-8 text-stone-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] text-stone-500 font-bold">DRAG & DROP IMAGE OR CLICK TO SELECT</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">JPEG or PNG files max 5MB size limit</span>

                    {/* Progress indicator */}
                    {uploadProgress !== null && (
                      <div className="absolute inset-0 bg-stone-950/80 flex items-center justify-center">
                        <div className="text-center w-2/3">
                          <span className="text-[10px] text-[#FFCD00] font-bold block mb-1">UPLOADING IMAGE: {uploadProgress}%</span>
                          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#FFCD00] h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Files Pills */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {uploadedFiles.map((fn, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-[#FFCD00]/10 border border-[#FFCD00]/25 rounded text-[10px] font-bold text-[#FFCD00]">
                          <span>{fn}</span>
                          <button
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}
                            className="hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleTaskStateTransition("completed")}
                  disabled={activeTask.status === "completed" || activeTask.status === "closed"}
                >
                  Mark as Complete
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleTaskStateTransition("closed")}
                  disabled={activeTask.status === "closed"}
                >
                  Close Work Order
                </Button>
              </div>
            </Card>
          )}

          {/* Today's Task List Table */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Today's Assigned Maintenance Tasks</CardTitle>
              <CardDescription>Click a card above or a row below to select your active work order</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <th className="py-3 px-5">Work Order</th>
                    <th className="py-3 px-5">Machinery</th>
                    <th className="py-3 px-5">Priority</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {tasks.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setActiveTaskId(t.id)}
                      className={`cursor-pointer transition-colors ${
                        activeTaskId === t.id 
                          ? "bg-[#FFCD00]/5 dark:bg-[#FFCD00]/5 hover:bg-[#FFCD00]/10" 
                          : "hover:bg-stone-50/50 dark:hover:bg-stone-800/20"
                      }`}
                    >
                      <td className="py-3.5 px-5 font-bold">{t.id}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-stone-800 dark:text-stone-100 block">{t.asset}</span>
                        <span className="text-[10px] text-stone-500 mt-0.5 block">{t.taskName}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant={t.priority === "CRITICAL" ? "danger" : t.priority === "WARNING" ? "warning" : "neutral"}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-[10px] font-bold uppercase text-stone-400 font-mono">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

        {/* Right 1 Column: Assigned Machines & Completed History */}
        <div className="space-y-6">
          
          {/* Assigned Machines */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Assigned Machinery Supervisors</h3>
            <div className="space-y-3">
              {assignedMachines.map((m) => (
                <div key={m.serial} className="p-3 bg-stone-50 dark:bg-stone-950/65 rounded border border-stone-300 dark:border-stone-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-50 block">{m.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono block mt-0.5">{m.serial}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-extrabold block ${
                      m.status === "warning" ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {m.health}
                    </span>
                    <Badge variant={m.status === "warning" ? "warning" : "success"} className="mt-1 text-[8px] px-1 py-0">
                      {m.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recently Completed Repairs (History) */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Completed Repair History</h3>
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="text-xs space-y-1 pb-3 last:pb-0 border-b last:border-0 border-stone-200 dark:border-stone-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-stone-900 dark:text-stone-100">{h.asset}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{h.date}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-4">{h.taskName}</p>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="font-mono text-stone-400">Order ID: {h.id}</span>
                    <span className={`font-bold uppercase text-[9px] ${
                      h.status === "completed" ? "text-emerald-500" : "text-blue-500"
                    }`}>
                      {h.status}
                    </span>
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
