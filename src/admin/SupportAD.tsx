import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface Reply {
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  raisedByName: string;
  raisedByType: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  replies: Reply[];
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};

const SupportAD: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("open");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ tickets: Ticket[] }>("/admin/support/tickets");
      setTickets(data.tickets || []);
    } catch {
      toast.error("Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="font-inter">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
        Stores can now message Astercart support directly in-app (Store dashboard → Support).
        This replaces relying solely on WhatsApp/email for platform-level issues like payout
        delays or technical problems.
      </div>

      <div className="flex gap-2 mb-4">
        {(["open", "in_progress", "resolved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filter === f ? "bg-pry text-white border-pry" : "text-gray-500 border-gray-200"
            }`}
          >
            {f === "all" ? "All" : f === "in_progress" ? "In progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No tickets here.</p>
        ) : (
          <div className="divide-y">
            {filtered.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className="w-full text-left p-4 hover:bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-sm">{t.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t.raisedByName} ({t.raisedByType}) · {t.category} ·{" "}
                    {new Date(t.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[t.status]}`}>
                  {t.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <AdminTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => { setSelectedTicket(null); load(); }}
        />
      )}
    </div>
  );
};

const AdminTicketModal: React.FC<{
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
}> = ({ ticket, onClose, onUpdated }) => {
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.put(`/admin/support/tickets/${ticket._id}/reply`, { message: reply, status });
      toast.success("Reply sent.");
      onUpdated();
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  // A genuinely independent action — admin can now mark a ticket
  // resolved/closed WITHOUT being forced to also type a reply message.
  // Previously the status dropdown only ever changed local state; the
  // only button that submitted anything was disabled unless a reply was
  // typed, so selecting "Resolved" and closing the modal silently
  // discarded that choice with no actual change saved anywhere.
  const handleStatusUpdate = async () => {
    if (status === ticket.status) return; // nothing actually changed
    setUpdatingStatus(true);
    try {
      await api.put(`/admin/support/tickets/${ticket._id}/status`, { status });
      toast.success(`Ticket marked as ${status.replace("_", " ")}.`);
      onUpdated();
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{ticket.subject}</h3>
            <p className="text-xs text-gray-400">{ticket.raisedByName} · {ticket.category}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{ticket.raisedByName} · {new Date(ticket.createdAt).toLocaleString("en-GB")}</p>
            <p className="text-sm">{ticket.message}</p>
          </div>
          {ticket.replies.map((r, i) => (
            <div key={i} className={`rounded-lg p-3 ${r.senderType === "admin" ? "bg-orange-50 ml-4" : "bg-gray-50"}`}>
              <p className="text-xs text-gray-400 mb-1">{r.senderName} · {new Date(r.createdAt).toLocaleString("en-GB")}</p>
              <p className="text-sm">{r.message}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
          >
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={updatingStatus || status === ticket.status}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-40"
          >
            {updatingStatus ? "Updating..." : "Update status"}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type a reply..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
          />
          <button
            onClick={handleReply}
            disabled={sending || !reply.trim()}
            className="px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportAD;
