import React, { useEffect, useState } from "react";
import api from "../utils/api";

type AdminOrder = {
  _id: string;
  customerName: string;
  storeName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  products: { name: string; quantity: number; price: number }[];
};

const OrdersAD: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<AdminOrder[]>("/adminOrder");
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatNaira = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

  if (loading) return <p className="p-4 text-gray-500">Loading orders...</p>;

  return (
    <div className="bg-white rounded-xl p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">All marketplace orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-2">Customer</th>
              <th>Store</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b">
                <td className="py-3">{o.customerName}</td>
                <td>{o.storeName}</td>
                <td>{formatNaira(o.totalAmount)}</td>
                <td>{o.paymentStatus}</td>
                <td>{o.status}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersAD;
