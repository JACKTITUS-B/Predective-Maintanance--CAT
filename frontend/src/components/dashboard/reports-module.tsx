import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const ReportsModule: React.FC = () => {
  const [interval, setIntervalVal] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [topic, setTopic] = useState<"Machine Health" | "Failure Analysis" | "Maintenance" | "Fuel Usage" | "Downtime">("Machine Health");
  const [exportingType, setExportingType] = useState<"pdf" | "excel" | null>(null);

  // Generate mockup records based on Topic
  const getPreviewData = () => {
    switch (topic) {
      case "Machine Health":
        return {
          headers: ["Machinery Asset", "Serial Tag", "Facility Site", "Average Health", "Operating Status"],
          rows: [
            ["CAT 797F Mining Truck #01", "CAT-797F-PE01", "PSG CAS", "74.5%", "Warning"],
            ["CAT 320 Excavator #03", "CAT-320-PE03", "PSG CAS", "96.2%", "Nominal"],
            ["CAT D11 Track Dozer #07", "CAT-D11-PE07", "PSG CAS", "92.0%", "Nominal"],
            ["CAT CB10 Utility Roller #04", "CAT-CB10-DE04", "Decatur Facility", "95.9%", "Nominal"],
            ["CAT 988 Wheel Loader #09", "CAT-988-TU09", "Tucson Proving", "94.0%", "Nominal"]
          ]
        };
      case "Failure Analysis":
        return {
          headers: ["Machinery Asset", "Predicted Failure Mode", "FastAPI Probability", "RUL Forecast", "Mitigation Action"],
          rows: [
            ["CAT 797F Mining Truck #01", "Bearing Failure", "64%", "48 hours", "Grease & Align bearings"],
            ["CAT D11 Track Dozer #07", "Hydraulic Failure", "12%", "620 hours", "Scheduled hose check"],
            ["CAT 320 Excavator #03", "Engine Overheat", "5%", "890 hours", "Routine coolant top-up"],
            ["CAT CB10 Utility Roller #04", "Battery Failure", "2%", "1420 hours", "Clean battery terminals"]
          ]
        };
      case "Maintenance":
        return {
          headers: ["Order ID", "Machinery Asset", "Service Task Description", "Maintenance Engineer", "Cost Total"],
          rows: [
            ["WO-9821", "CAT 797F #01", "Z-Axis Bearing Alignment", "Alex Smith", "$1,240"],
            ["WO-9825", "CAT D11 #07", "Radiator Hose Tightening", "John Doe", "$340"],
            ["WO-9755", "CAT 320 #03", "Hydraulic Fluid Flushing", "Elena Rostova", "$1,890"],
            ["WO-9740", "CAT 988 #02", "Alternator Voltage Calib", "Mark Vance", "$450"]
          ]
        };
      case "Fuel Usage":
        return {
          headers: ["Machinery Asset", "Runtime Hours", "Total Fuel Consumed", "Avg Economy (Gal/Hr)", "Efficiency rating"],
          rows: [
            ["CAT 797F Mining Truck #01", "124 hrs", "12,400 Gal", "100.0 Gal/hr", "Nominal"],
            ["CAT D11 Track Dozer #07", "98 hrs", "4,900 Gal", "50.0 Gal/hr", "Optimal"],
            ["CAT 320 Excavator #03", "84 hrs", "2,100 Gal", "25.0 Gal/hr", "Optimal"],
            ["CAT 988 Wheel Loader #02", "110 hrs", "6,600 Gal", "60.0 Gal/hr", "Nominal"]
          ]
        };
      case "Downtime":
        return {
          headers: ["Machinery Asset", "Facility Location", "Downtime Duration", "Primary Component Cause", "Resolution status"],
          rows: [
            ["CAT 797F Mining Truck #01", "PSG CAS", "4.5 hours", "Bearing Vibration Limit", "Resolved"],
            ["CAT D11 Track Dozer #07", "PSG CAS", "1.2 hours", "Radiator Hose Leakage", "Resolved"],
            ["CAT 320 Excavator #03", "Decatur Facility", "2.0 hours", "Hydraulic Gasket Blowout", "Pending parts"],
            ["CAT CB10 Utility Roller #04", "Decatur Facility", "0.5 hours", "Battery Terminal Corrosion", "Resolved"]
          ]
        };
    }
  };

  const preview = getPreviewData();

  // Export report simulation
  const handleExport = (type: "pdf" | "excel") => {
    setExportingType(type);
    setTimeout(() => {
      const data = getPreviewData();
      let fileContent = "";
      let filename = `CAT-${topic.replace(" ", "-")}-${interval}-Report`;

      if (type === "pdf") {
        fileContent = `CATERPILLAR OPERATIONAL REPORT
========================================
Report Type: ${topic}
Report Scope: ${interval} Period
Generated: ${new Date().toLocaleString()}
========================================

DATA SET SUMMARY:
${data.headers.join(" | ")}
----------------------------------------
${data.rows.map((row) => row.join(" | ")).join("\n")}

========================================
CONFIDENTIAL - CATERPILLAR HACKATHON CORE INC.`;
        filename += ".pdf";
      } else {
        // Excel/CSV CSV format
        fileContent = `"${data.headers.join('","')}"\n` + 
          data.rows.map((row) => `"${row.join('","')}"`).join("\n");
        filename += ".csv";
      }

      const blob = new Blob([fileContent], { type: type === "pdf" ? "application/pdf" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportingType(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Selector Filters Header Bar */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {/* Interval Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Report Period Scope</span>
              <div className="flex gap-2">
                {(["Daily", "Weekly", "Monthly"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setIntervalVal(opt)}
                    className={`flex-1 py-2 px-3 rounded text-xs font-bold border transition-all ${
                      interval === opt
                        ? "bg-[#FFCD00] text-black border-[#FFCD00]"
                        : "bg-stone-100 text-stone-500 border-stone-300 hover:text-stone-800 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700 dark:hover:text-stone-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Report Subject Module</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as any)}
                className="w-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700 py-2 px-3 rounded focus:outline-none focus:border-[#FFCD00]"
              >
                <option value="Machine Health">Machine Health Overview</option>
                <option value="Failure Analysis">Failure Analysis Forecast</option>
                <option value="Maintenance">Maintenance Action Ledger</option>
                <option value="Fuel Usage">Fuel Efficiency Logs</option>
                <option value="Downtime">Downtime Duration Audits</option>
              </select>
            </div>
          </div>

          {/* Export Controls */}
          <div className="flex gap-3 shrink-0">
            
            <Button
              onClick={() => handleExport("pdf")}
              disabled={exportingType !== null}
              variant="outline"
              className="flex items-center gap-2 text-xs font-bold py-2.5 px-4"
            >
              {exportingType === "pdf" ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Compiling PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Report
                </>
              )}
            </Button>

            <Button
              onClick={() => handleExport("excel")}
              disabled={exportingType !== null}
              variant="primary"
              className="flex items-center gap-2 text-xs font-bold py-2.5 px-4"
            >
              {exportingType === "excel" ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Compiling Excel...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Excel Spreadsheet
                </>
              )}
            </Button>

          </div>

        </div>
      </Card>

      {/* Report Preview Card Container */}
      <Card>
        <CardHeader className="py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Report Data Preview: {topic}</CardTitle>
              <CardDescription>Generated for the active {interval} operational interval</CardDescription>
            </div>
            <Badge variant="warning" className="uppercase font-mono text-[10px]">
              {interval} scope
            </Badge>
          </div>
        </CardHeader>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                {preview.headers.map((h, idx) => (
                  <th key={idx} className="py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {preview.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/15 transition-colors">
                  {row.map((cell, cellIdx) => {
                    // Render status colors if cell represents status/priority
                    const isStatusCell = cellIdx === preview.headers.length - 1;
                    return (
                      <td key={cellIdx} className="py-3.5 px-5">
                        {isStatusCell ? (
                          <Badge variant={cell === "Warning" || cell === "Pending parts" ? "warning" : "success"}>
                            {cell}
                          </Badge>
                        ) : (
                          <span className={`${cellIdx === 0 ? "font-bold text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}`}>
                            {cell}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
