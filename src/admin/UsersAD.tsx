import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

type Customer = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  status?: string;
  createdAt?: string;
};

const UsersAD: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Customer[]>("/adminCustomer/customers");
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBlock = async (id: string, currentStatus: string) => {
    const action = currentStatus === "rejected" ? "unblock" : "block";
    setBlockingId(id);
    try {
      await api.put(`/adminCustomer/customers/${id}/${action}`);
      toast.success(`Customer ${action === "block" ? "blocked" : "unblocked"} successfully`);
      load();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setBlockingId(null);
    }
  };

  const filtered = customers.filter(
    (c) =>
      search === "" ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const active = customers.filter((c) => c.status === "completed").length;
  const blocked = customers.filter((c) => c.status === "rejected").length;

  if (loading) return <p className="p-4 text-gray-500">Loading customers...</p>;

  return (
    <div className="font-inter">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total customers", value: customers.length },
          { label: "Active", value: active, color: "text-green-600" },
          { label: "Blocked", value: blocked, color: "text-red-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${(s as { color?: string }).color || ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:border-pry"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No customers found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="px-4">Email</th>
                <th className="px-4">Status</th>
                <th className="px-4">Joined</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const id = c._id || c.id || "";
                const isBlocked = c.status === "rejected";
                return (
                  <tr key={id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{c.name || "—"}</td>
                    <td className="px-4 text-gray-500">{c.email}</td>
                    <td className="px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isBlocked
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 text-gray-400 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="px-4">
                      <button
                        onClick={() => handleBlock(id, c.status || "")}
                        disabled={blockingId === id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                          isBlocked
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {blockingId === id ? "..." : isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersAD;
