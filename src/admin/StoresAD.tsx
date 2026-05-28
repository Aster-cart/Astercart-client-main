import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

type StoreRow = {
  storeId: string;
  name: string;
  email: string;
  state: string;
  status: string;
};

const StoresAD: React.FC = () => {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get<{ stores: StoreRow[] }>("/store/adminstore");
      setStores(data.stores || []);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (id: string, shouldBlock: boolean) => {
    try {
      await api.put(`/store/adminstore/${id}/${shouldBlock ? "block" : "unblock"}`);
      toast.success(shouldBlock ? "Store blocked" : "Store activated");
      load();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Loading stores...</p>;

  return (
    <div className="bg-white rounded-xl p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Registered supermarkets</h2>
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="py-2 text-left">Name</th>
            <th>Email</th>
            <th>State</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.storeId} className="border-b">
              <td className="py-3">{s.name}</td>
              <td>{s.email}</td>
              <td>{s.state}</td>
              <td>{s.status}</td>
              <td>
                <button
                  className="text-pry text-xs font-medium"
                  onClick={() => toggleBlock(s.storeId, s.status !== "inactive")}
                >
                  {s.status === "active" ? "Block" : "Unblock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StoresAD;
