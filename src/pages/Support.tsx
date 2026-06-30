import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface Reply {
  senderType: "store" | "admin";
  senderName: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
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

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const CATEGORIES = [
  { value: "payout", label: "Payout issue" },
  { value: "technical", label: "Technical / app bug" },
  { value: "account", label: "Account / profile issue" },
  { value: "order_issue", label: "Order-related issue" },
  { value: "other", label: "Something else" },
];

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ tickets: Ticket[] }>("/store/support/tickets");
      setTickets(data.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress");

  return (
    <div className="font-inter pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Contact Astercart Support</h2>
          <p className="text-sm text-gray-400">
            Raise an issue directly with the Astercart team — payouts, technical problems, or anything
            else that isn't a customer dispute about a specific order.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium"
        >
          + New message
        </button>
      </div>

      {openTickets.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          You have {openTickets.length} open conversation{openTickets.length !== 1 ? "s" : ""} with support.
        </div>
      )}

      <div className="bg-white rounded-xl border">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading...</p>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-3">You haven't contacted support yet.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium"
            >
              Send your first message
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className="w-full text-left p-4 hover:bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-sm">{t.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(t.createdAt).toLocaleDateString("en-GB")} ·{" "}
                    {t.replies.length} repl{t.replies.length === 1 ? "y" : "ies"}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[t.status]}`}>
                  {STATUS_LABEL[t.status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showNewModal && (
        <NewTicketModal
          onClose={() => setShowNewModal(false)}
          onSent={() => { setShowNewModal(false); load(); }}
        />
      )}

      {selectedTicket && (
        <TicketThreadModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onReplySent={() => { load(); }}
        />
      )}
    </div>
  );
};

// ─── New ticket modal ─────────────────────────────────────────────────────────
const NewTicketModal: React.FC<{ onClose: () => void; onSent: () => void }> = ({ onClose, onSent }) => {
  const [category, setCategory] = useState("other");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/store/support/tickets", { category, subject, message });
      toast.success("Message sent to Astercart support.");
      onSent();
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h3 className="font-semibold text-lg mb-4">Contact support</h3>

        <label className="text-xs text-gray-500 font-medium block mb-1">What's this about?</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-pry"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <label className="text-xs text-gray-500 font-medium block mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of the issue"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-pry"
        />

        <label className="text-xs text-gray-500 font-medium block mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Describe the issue in detail..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-pry resize-none"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send to support"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Ticket thread modal — view replies and respond ────────────────────────────
const TicketThreadModal: React.FC<{
  ticket: Ticket;
  onClose: () => void;
  onReplySent: () => void;
}> = ({ ticket, onClose, onReplySent }) => {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [localTicket, setLocalTicket] = useState(ticket);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/store/support/tickets/${ticket._id}/reply`, { message: reply });
      setLocalTicket(data.ticket);
      setReply("");
      onReplySent();
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{localTicket.subject}</h3>
            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[localTicket.status]}`}>
              {STATUS_LABEL[localTicket.status]}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">You · {new Date(localTicket.createdAt).toLocaleString("en-GB")}</p>
            <p className="text-sm">{localTicket.message}</p>
          </div>
          {localTicket.replies.map((r, i) => (
            <div key={i} className={`rounded-lg p-3 ${r.senderType === "admin" ? "bg-orange-50 ml-4" : "bg-gray-50"}`}>
              <p className="text-xs text-gray-400 mb-1">
                {r.senderType === "admin" ? "Astercart Support" : "You"} · {new Date(r.createdAt).toLocaleString("en-GB")}
              </p>
              <p className="text-sm">{r.message}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type a reply..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
            onKeyDown={(e) => { if (e.key === "Enter") handleReply(); }}
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

export default Support;
