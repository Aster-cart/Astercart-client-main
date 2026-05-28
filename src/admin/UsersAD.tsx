import React, { useEffect, useState } from "react";
import api from "../utils/api";

type Customer = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  status?: string;
};

const UsersAD: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ customers?: Customer[] } | Customer[]>(
          "/adminCustomer/customers"
        );
        const list = Array.isArray(data) ? data : data.customers || [];
        setCustomers(list);
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-4 text-gray-500">Loading customers...</p>;

  return (
    <div className="bg-white rounded-xl p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Customers</h2>
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="py-2 text-left">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id || c.id} className="border-b">
              <td className="py-3">{c.name || "—"}</td>
              <td>{c.email}</td>
              <td>{c.phoneNumber || "—"}</td>
              <td>{c.status || "active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersAD;
