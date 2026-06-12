import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

type Customer = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  customerStatus?: string;
  createdAt?: string;
  orderCount?: number;
};

type CustomerOrder = {
  _id: string;
  storeName?: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

type View = "list" | "detail";

const UsersAD: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
      toast.error("Action failed.");
    } finally {
      setBlockingId(null);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setView("detail");
    setLoadingOrders(true);
    try {
      const id = customer._id || customer.id;
      const { data } = await api.get<{ orders: CustomerOrder[] }>(`/adminOrder?customerId=${id}`);
      const orders = Array.isArray(data) ? data : data.orders || [];
      setCustomerOrders(orders.filter((o: any) =>
        o.customerId === id || o.customerId?._id === id
      ));
    } catch {
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filtered = customers.filter((c) =>
    search === "" ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const active = customers.filter((c) => c.customerStatus !== "rejected").length;
  const blocked = customers.filter((c) => c.customerStatus === "rejected").length;

  if (loading) return <p className="p-4 text-gray-500">Loading customers...</p>;

  // Customer detail view
  if (view === "detail" && selectedCustomer) {
    const id = selectedCustomer._id || selectedCustomer.id || "";
    const isBlocked = selectedCustomer.customerStatus === "rejected";
    return (
      <div className="font-inter">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          ← Back to customers
        </button>

        {/* Profile card */}
        <div className="bg-white rounded-xl p-6 border mb-4 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-pry flex items-center justify-center text-white text-2xl font-bold">
            {(selectedCustomer.name || "C").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                {isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
            <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
            {selectedCustomer.phoneNumber && <p className="text-sm text-gray-400">{selectedCustomer.phoneNumber}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Joined {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString("en-GB") : "—"}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleBlock(id, selectedCustomer.customerStatus || "")}
                className={`text-xs px-4 py-1.5 rounded-lg font-medium ${isBlocked ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}
              >
                {isBlocked ? "Unblock" : "Block customer"}
              </button>
            </div>
          </div>
        </div>

        {/* Customer orders */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Order history ({customerOrders.length})</h3>
          </div>
          {loadingOrders ? (
            <p className="p-4 text-gray-400 text-sm">Loading orders...</p>
          ) : customerOrders.length === 0 ? (
            <p className="p-4 text-gray-400 text-sm">No orders yet.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b text-xs">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="px-4">Store</th>
                  <th className="px-4">Amount</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Payment</th>
                  <th className="px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map((o) => (
                  <tr key={o._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4">{o.storeName || "—"}</td>
                    <td className="px-4 font-medium">₦{o.totalAmount?.toLocaleString()}</td>
                    <td className="px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 capitalize">
                        {o.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${o.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 text-gray-400 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

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
            <p className={`text-2xl font-bold mt-1 ${(s as any).color || ""}`}>{s.value}</p>
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
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const id = c._id || c.id || "";
                const isBlocked = c.customerStatus === "rejected";
                return (
                  <tr key={id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{c.name || "—"}</td>
                    <td className="px-4 text-gray-500">{c.email}</td>
                    <td className="px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 text-gray-400 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCustomer(c)}
                          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleBlock(id, c.customerStatus || "")}
                          disabled={blockingId === id}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isBlocked ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}
                        >
                          {blockingId === id ? "..." : isBlocked ? "Unblock" : "Block"}
                        </button>
                      </div>
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
