import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  assigned_site?: string;
  role_name?: string;
}

interface Message {
  id: string;
  sender: string;
  sender_email: string;
  sender_name: string;
  recipient: string;
  recipient_email: string;
  recipient_name: string;
  site: string;
  machine_code: string;
  subject: string;
  body: string;
  is_read: boolean;
  status: string; // Open, Waiting for Reply, Resolved
  created_at: string;
}

interface MessagesWorkspaceProps {
  prefilledManagerId?: string;
  prefilledMessageContext?: string;
  prefilledMessageBody?: string;
  onClearPrefill?: () => void;
}

const fallbackSupervisors: UserProfile[] = [
  { id: "supervisor-1", email: "manager.psg@cat.com", name: "Mark Vance", assigned_site: "PSG CAS Site", role_name: "Site Manager" },
  { id: "supervisor-2", email: "manager.decatur@cat.com", name: "Sarah Jenkins", assigned_site: "Decatur Facility", role_name: "Site Manager" },
  { id: "supervisor-3", email: "manager.aurora@cat.com", name: "Dave Miller", assigned_site: "Aurora Factory", role_name: "Site Manager" },
  { id: "supervisor-4", email: "manager.tucson@cat.com", name: "Elena Rostova", assigned_site: "Tucson Proving Ground", role_name: "Site Manager" }
];

export const MessagesWorkspace: React.FC<MessagesWorkspaceProps> = ({
  prefilledManagerId,
  prefilledMessageContext,
  prefilledMessageBody,
  onClearPrefill
}) => {
  const { user } = useAuth();
  const [managers, setManagers] = useState<UserProfile[]>(fallbackSupervisors);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedManager, setSelectedManager] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  
  // Composer states
  const [messageBody, setMessageBody] = useState("");
  const [machineContext, setMachineContext] = useState("");
  const [activeSubject, setActiveSubject] = useState("");

  const threadEndRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role?.name === "Super Admin";

  // Fetch managers & message list
  const fetchManagers = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/users/?role=Site+Manager", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        if (list.length > 0) {
          setManagers(list);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch site managers list, using local supervisors fallback.", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/notifications/messages/");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setMessages(list);
      }
    } catch (err) {
      console.warn("Failed to fetch messages list:", err);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchMessages();
    
    // Poll for messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle prefill redirection
  useEffect(() => {
    if (prefilledManagerId && managers.length > 0) {
      const found = managers.find(m => m.id === prefilledManagerId || m.email === prefilledManagerId);
      if (found) {
        setSelectedManager(found);
        if (prefilledMessageContext) {
          setMachineContext(prefilledMessageContext);
          setActiveSubject(prefilledMessageContext);
        }
        if (prefilledMessageBody) {
          setMessageBody(prefilledMessageBody);
        }
        if (onClearPrefill) {
          onClearPrefill();
        }
      }
    }
  }, [prefilledManagerId, managers]);

  // Scroll to bottom of message thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedManager]);

  // Group contacts / managers list
  const filteredManagers = useMemo(() => {
    let list = [...managers];
    
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }

    // Site filter
    if (siteFilter !== "all") {
      list = list.filter(m => {
        const siteName = m.assigned_site || "";
        if (siteFilter === "PSG CAS") return siteName.includes("PSG CAS");
        if (siteFilter === "Decatur") return siteName.includes("Decatur");
        if (siteFilter === "Aurora") return siteName.includes("Aurora");
        if (siteFilter === "Tucson") return siteName.includes("Tucson");
        return true;
      });
    }

    return list;
  }, [managers, searchQuery, siteFilter]);

  // If Site Manager, they only see the Super Admin
  const adminContacts = useMemo(() => {
    if (isSuperAdmin) return [];
    return [{
      id: "super-admin",
      email: "admin@cat.com",
      name: "Super Admin",
      assigned_site: "Global Support",
      role_name: "Super Admin"
    }];
  }, [isSuperAdmin]);

  // Filter messages for active chat thread
  const activeChatMessages = useMemo(() => {
    if (!selectedManager) return [];
    return messages.filter(m => 
      (m.sender_email === user?.email && m.recipient_email === selectedManager.email) ||
      (m.sender_email === selectedManager.email && m.recipient_email === user?.email)
    );
  }, [messages, selectedManager, user]);

  // Read latest conversation status from thread
  const conversationStatus = useMemo(() => {
    if (activeChatMessages.length === 0) return "Open";
    return activeChatMessages[activeChatMessages.length - 1].status || "Open";
  }, [activeChatMessages]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager || !messageBody.trim()) return;

    let recipientId = selectedManager.id;
    try {
      const res = await fetch("http://localhost:8000/api/auth/users/", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      if (res.ok) {
        const users = await res.json();
        const list = Array.isArray(users) ? users : users.results || [];
        const found = list.find((u: any) => u.email === selectedManager.email);
        if (found) {
          recipientId = found.id;
        }
      }
    } catch (err) {
      console.warn("Failed dynamically looking up recipient ID by email:", err);
    }

    const payload = {
      recipient: recipientId,
      recipient_email: selectedManager.email,
      body: messageBody,
      site: selectedManager.assigned_site || "Global Support",
      machine_code: machineContext,
      subject: activeSubject || machineContext || "Direct Message",
      status: "Waiting for Reply"
    };

    try {
      const res = await fetch("http://localhost:8000/api/notifications/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessageBody("");
        setMachineContext("");
        setActiveSubject("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (activeChatMessages.length === 0) return;
    const lastMsg = activeChatMessages[activeChatMessages.length - 1];

    try {
      const res = await fetch(`http://localhost:8000/api/notifications/messages/${lastMsg.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error("Error updating thread status:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] animate-fade-in">
      
      {/* LEFT PANEL: CONTACTS FILTER & SEARCH */}
      <Card className="lg:col-span-1 p-4 flex flex-col gap-4 border-stone-200 dark:border-stone-800 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">CONTACTS</h3>
          <p className="text-[10px] text-stone-500 mt-0.5">Select a supervisor to message</p>
        </div>

        {isSuperAdmin ? (
          <>
            {/* Filters */}
            <div className="space-y-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supervisors..."
                className="w-full text-xs bg-stone-950 text-stone-300 border border-stone-850 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#FFCD00]"
              />

              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="w-full text-xs bg-stone-950 text-stone-300 border border-stone-850 rounded px-2.5 py-1.5"
              >
                <option value="all">All Sites</option>
                <option value="PSG CAS">PSG CAS</option>
                <option value="Decatur">Decatur Facility</option>
                <option value="Aurora">Aurora Factory</option>
                <option value="Tucson">Tucson Proving Ground</option>
              </select>
            </div>

            {/* Contacts List */}
            <div className="space-y-3 flex-1">
              {filteredManagers.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">No supervisors found.</p>
              ) : (
                <div className="space-y-1">
                  {filteredManagers.map((m) => {
                    const isSelected = selectedManager?.id === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedManager(m);
                          setMachineContext("");
                          setActiveSubject("");
                        }}
                        className={`p-3 rounded border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-[#FFCD00] text-black border-[#FFCD00]"
                            : "bg-stone-950 border-stone-850 text-stone-300 hover:bg-stone-900"
                        }`}
                      >
                        <div>
                          <span className="font-bold block">{m.name}</span>
                          <span className={`text-[9px] uppercase font-extrabold ${isSelected ? "text-stone-700" : "text-stone-500"}`}>
                            {m.assigned_site || "No Site"}
                          </span>
                        </div>
                        <span className={`w-2 h-2 rounded-full bg-emerald-500`} title="Online" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Site Manager Sidebar: show Global Support Admin contact */
          <div className="space-y-1">
            {adminContacts.map((m) => {
              const isSelected = selectedManager?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedManager(m)}
                  className={`p-3 rounded border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#FFCD00] text-black border-[#FFCD00]"
                      : "bg-stone-950 border-stone-850 text-stone-300 hover:bg-stone-900"
                  }`}
                >
                  <div>
                    <span className="font-bold block">{m.name}</span>
                    <span className={`text-[9px] uppercase font-extrabold ${isSelected ? "text-stone-700" : "text-stone-500"}`}>
                      {m.assigned_site}
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* RIGHT PANEL: CONVERSATION PANEL */}
      <Card className="lg:col-span-3 border-stone-200 dark:border-stone-800 flex flex-col h-full overflow-hidden">
        {selectedManager ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-850 bg-stone-950/20 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCD00] block">
                  Active Conversation
                </span>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  {selectedManager.name}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
                </h4>
                <p className="text-[10px] text-stone-500 font-bold uppercase">
                  Site: {selectedManager.assigned_site || "Global Support"}
                </p>
              </div>

              {/* Thread Status actions */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-stone-400">Status:</span>
                <select
                  value={conversationStatus}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="text-[10px] bg-stone-950 text-[#FFCD00] border border-stone-850 rounded px-2.5 py-1 font-bold uppercase focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="Waiting for Reply">Waiting for Reply</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <Badge variant={conversationStatus === "Resolved" ? "success" : conversationStatus === "Waiting for Reply" ? "warning" : "info"}>
                  {conversationStatus}
                </Badge>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-950/10">
              {activeChatMessages.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-3xl block mb-2">💬</span>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                    Start conversation with {selectedManager.name}
                  </p>
                  <p className="text-[10px] text-stone-600 max-w-[280px] mx-auto mt-1">
                    Send updates regarding critical sensors, failure risks, or maintenance logs.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeChatMessages.map((msg) => {
                    const isOwn = msg.sender_email === user?.email;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[70%] ${
                          isOwn ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <span className="text-[9px] text-stone-500 font-bold mb-1">
                          {isOwn ? "You" : msg.sender_name} &bull; {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isOwn
                              ? "bg-[#FFCD00] text-black rounded-tr-none font-semibold"
                              : "bg-stone-900 border border-stone-850 text-stone-200 rounded-tl-none"
                          }`}
                        >
                          {/* Subject / Machine context badge if applicable */}
                          {msg.machine_code && (
                            <Badge className="mb-2 block bg-black/40 text-stone-300 font-mono text-[9px] w-fit border border-stone-800">
                              Context: {msg.machine_code}
                            </Badge>
                          )}
                          <p>{msg.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Composer Footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-250 dark:border-stone-850 bg-stone-950/20 shrink-0 space-y-3">
              {/* Optional Machine Context input */}
              <div className="flex gap-4">
                <input
                  type="text"
                  value={machineContext}
                  onChange={(e) => setMachineContext(e.target.value)}
                  placeholder="Optional: Machine Code reference (e.g. CAT797F#01)..."
                  className="w-1/2 text-[10px] bg-stone-950 text-stone-300 border border-stone-850 rounded px-2.5 py-1 font-mono focus:outline-none"
                />
                <input
                  type="text"
                  value={activeSubject}
                  onChange={(e) => setActiveSubject(e.target.value)}
                  placeholder="Optional: Topic/Subject..."
                  className="w-1/2 text-[10px] bg-stone-950 text-stone-300 border border-stone-850 rounded px-2.5 py-1 focus:outline-none"
                />
              </div>

              {/* Body Input */}
              <div className="flex gap-3">
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder={`Write a message to ${selectedManager.name}...`}
                  rows={2}
                  className="flex-1 text-xs bg-stone-950 text-stone-200 border border-stone-850 rounded px-3 py-2 focus:outline-none focus:border-[#FFCD00] resize-none"
                />
                <Button
                  type="submit"
                  disabled={!messageBody.trim()}
                  className="bg-[#FFCD00] hover:bg-[#E6B800] text-black font-extrabold uppercase text-[10px] px-6 rounded shrink-0 transition-colors"
                >
                  Send &rarr;
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <span className="text-4xl block mb-3 animate-bounce">💬</span>
            <h4 className="text-sm font-extrabold uppercase tracking-wide text-stone-400">
              No Conversation Selected
            </h4>
            <p className="text-xs text-stone-500 max-w-[280px] mt-1.5 normal-case">
              Search and select a Site Supervisor from the contacts panel to open their threaded conversation line.
            </p>
          </div>
        )}
      </Card>

    </div>
  );
};
