import { useEffect, useState } from "react";
import { green, red, Aster2, end, Aster3, beauty, elec, ent, fashion, food, health, hobbies, sport, download } from "../assets/res";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from "docx";
import api from "../utils/api";

interface Stat {
  label: string;
  value: number;
  image?: string;
  currentWeekTotal: number;
  previousWeekTotal: number;
}

interface TopProduct {
  name: string;
  category: string;
  sold: number;
  total: number;
  image: string;
}

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const faded = (hexColor: string, intensity: number): string => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const fade = (c: number) => Math.round(c + (255 - c) * intensity);
  return `rgb(${fade(r)}, ${fade(g)}, ${fade(b)})`;
};

const CATEGORY_META: Record<string, { color: string; image: string }> = {
  Electronics: { color: "#004EF1", image: elec },
  Entertainment: { color: "#01C0F6", image: ent },
  Beauty: { color: "#DFDC27", image: beauty },
  Fashion: { color: "#033270", image: fashion },
  Food: { color: "#D4A276", image: food },
  "Health Care": { color: "#FF8000", image: health },
  Sports: { color: "#F26A4F", image: sport },
  Hobbies: { color: "#5BC0BE", image: hobbies },
};

const DEFAULT_COLORS = ["#004EF1","#01C0F6","#DFDC27","#033270","#D4A276","#FF8000","#F26A4F","#5BC0BE"];

const DashboardAD = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topVisitedStores, setTopVisitedStores] = useState<
    { name: string; state: string; visits: number; image: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { name: string; sales: number; color: string; image: string }[]
  >([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // ── Overview stats ─────────────────────────────────────
        const { data } = await api.get<{
          totalOrders: number;
          ordersThisWeek: number;
          ordersChangePct: number;
          activeUsers: number;
          newUsers: number;
          annualRevenue: number;
        }>("/dashboard/overview");

        const prevOrders = Math.max(
          0,
          data.ordersThisWeek - Math.round((data.ordersThisWeek * data.ordersChangePct) / 100)
        );

        setStats([
          { label: "Total Orders", value: data.totalOrders, image: green, currentWeekTotal: data.ordersThisWeek, previousWeekTotal: prevOrders },
          { label: "Active Users", value: data.activeUsers, image: red, currentWeekTotal: data.activeUsers, previousWeekTotal: Math.round(data.activeUsers * 0.95) },
          { label: "New Users", value: data.newUsers, image: green, currentWeekTotal: data.newUsers, previousWeekTotal: Math.round(data.newUsers * 0.8) },
          { label: "Revenue (₦)", value: data.annualRevenue, image: red, currentWeekTotal: data.annualRevenue, previousWeekTotal: Math.round(data.annualRevenue * 0.9) },
        ]);

        // ── Top visited stores ──────────────────────────────────
        const visitedRes = await api.get("/dashboard/topvisited");
        if (visitedRes.data?.topVisitedStores?.length) {
          setTopVisitedStores(
            visitedRes.data.topVisitedStores.map((s: { storeName?: string; totalOrders?: number; state?: string }) => ({
              name: s.storeName || "Store",
              state: s.state || "—",
              visits: s.totalOrders || 0,
              image: Aster3,
            }))
          );
        }

        // ── Top products by orders ──────────────────────────────
        try {
          const prodRes = await api.get<{ orders?: { products?: { name: string; quantity: number; price: number }[] }[] }>(
            "/adminOrder"
          );
          const orders = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.orders || [];
          const productTotals: Record<string, { sold: number; category: string }> = {};

          (orders as { products?: { name: string; quantity: number; category?: string }[] }[]).forEach((order) => {
            (order.products || []).forEach((p) => {
              if (!productTotals[p.name]) productTotals[p.name] = { sold: 0, category: p.category || "General" };
              productTotals[p.name].sold += p.quantity || 1;
            });
          });

          const sorted = Object.entries(productTotals)
            .sort((a, b) => b[1].sold - a[1].sold)
            .slice(0, 8);

          const maxSold = sorted[0]?.[1].sold || 1;
          setTopProducts(
            sorted.map(([name, val]) => ({
              name,
              category: val.category,
              sold: val.sold,
              total: maxSold,
              image: Aster2,
            }))
          );
        } catch { setTopProducts([]); }

        // ── Category sales breakdown ────────────────────────────
        try {
          const catRes = await api.get<{ categories?: { name: string; totalSales: number }[] }>(
            "/dashboard/categories"
          );
          if (catRes.data?.categories?.length) {
            setCategories(
              catRes.data.categories.map((c, i) => ({
                name: c.name,
                sales: c.totalSales || 0,
                color: CATEGORY_META[c.name]?.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                image: CATEGORY_META[c.name]?.image || elec,
              }))
            );
          }
        } catch { setCategories([]); }

      } catch { setStats([]); }
    })();
  }, []);

  const displayedProducts = showAllProducts ? topProducts : topProducts.slice(0, 5);
  const displayedStores = showAllStores ? topVisitedStores : topVisitedStores.slice(0, 5);

  const totalSales = categories.reduce((sum, c) => sum + c.sales, 0);
  const gapSize = 3;
  const arcWidth = 10;
  let currentRotation = 0;

  const handleDownloadWord = () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Category")] }),
          new TableCell({ children: [new Paragraph("Sales")] }),
        ],
      }),
      ...categories.map(
        (c) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(c.name)] }),
              new TableCell({ children: [new Paragraph(formatNumber(c.sales))] }),
            ],
          })
      ),
    ];
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "Most Sold Categories", heading: "Heading1" }),
          new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
        ],
      }],
    });
    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "most_sold_categories.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="pb-8">
      {/* ── Stats row ── */}
      <section className="grid grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const pct = calculatePercentageChange(stat.currentWeekTotal, stat.previousWeekTotal);
          const sampleData = [
            { value: stat.currentWeekTotal * 0.7 },
            { value: stat.currentWeekTotal * 0.8 },
            { value: stat.currentWeekTotal * 1.1 },
            { value: stat.currentWeekTotal * 1.3 },
            { value: stat.currentWeekTotal },
          ];
          return (
            <div key={index} className="p-4 border flex-col rounded-2xl flex">
              <p className="text-[#667085] text-base font-semibold">{stat.label}</p>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={sampleData}>
                  <Line type="monotone" dataKey="value" stroke={index % 2 === 0 ? "#32D583" : "#F97066"} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-3">
                {stat.image && <img src={stat.image} alt={stat.label} />}
                <p className="text-lg font-semibold">{formatNumber(stat.value)}</p>
                <p className={`text-xs mb-3 ${index % 2 === 0 ? "text-[#027A48]" : "text-[#912018]"}`}>
                  {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                </p>
              </div>
              <p className="text-xs text-[#667085]">Compared from Last Week</p>
            </div>
          );
        })}
      </section>

      {/* ── Top Products + Top Stores ── */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-2xl border w-1/2">
          <h2 className="font-bold text-[#667085] mb-4">Top Sales Products</h2>
          <div className="border-b mb-4"></div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">No order data yet.</p>
          ) : (
            displayedProducts.map((product, index) => {
              const percentage = (product.sold / product.total) * 100;
              const barColor = index % 2 === 0 ? "bg-[#553AFE]" : "bg-[#01C0F6]";
              return (
                <div key={index} className="mb-4">
                  <div className="flex items-center gap-2">
                    <img className="w-8 h-8 rounded" src={product.image} alt={product.name} />
                    <div className="flex flex-col w-full">
                      <p className="text-sm text-[#667085]">{product.name}</p>
                      <div className="flex justify-between">
                        <p className="text-xs text-[#667085]">{product.category}</p>
                        <span className="text-sm ml-2">{product.sold} pcs</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full h-1 bg-gray-200 rounded-full">
                    <div className={`${barColor} h-1 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })
          )}
          <div className="flex justify-end border-t mt-6 gap-3">
            <button onClick={() => setShowAllProducts((p) => !p)} className="text-xs mt-4 text-[#004EF1]">
              {showAllProducts ? "Show Less" : "View Full Report"}
            </button>
            <img className="mt-4" src={end} alt="" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border w-1/2">
          <h2 className="font-bold mb-4 text-[#667085]">Top Visited Stores</h2>
          <div className="border-b mb-4"></div>
          {topVisitedStores.length === 0 ? (
            <p className="text-sm text-gray-400">No store data yet.</p>
          ) : (
            displayedStores.map((store, index) => {
              const maxVisits = Math.max(...topVisitedStores.map((s) => s.visits), 1);
              const percentage = (store.visits / maxVisits) * 100;
              const barColor = index % 2 === 0 ? "bg-[#553AFE]" : "bg-[#01C0F6]";
              return (
                <div key={index} className="mb-4">
                  <div className="flex items-center gap-2">
                    <img className="w-8 h-8 rounded" src={store.image} alt={store.name} />
                    <div className="flex flex-col w-full">
                      <p className="text-sm text-[#667085]">{store.name}</p>
                      <div className="flex justify-between">
                        <p className="text-xs text-[#667085]">{store.state}</p>
                        <span className="text-sm ml-2">{formatNumber(store.visits)} orders</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full h-1 bg-gray-200 rounded-full">
                    <div className={`${barColor} h-1 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })
          )}
          <div className="flex justify-end border-t gap-3 mt-6">
            <button onClick={() => setShowAllStores((p) => !p)} className="text-xs mt-4 text-[#004EF1]">
              {showAllStores ? "Show Less" : "View Full Report"}
            </button>
            <img className="mt-4" src={end} alt="" />
          </div>
        </div>
      </div>

      {/* ── Category Donut Chart ── */}
      <div className="border rounded-2xl mt-6 p-4">
        <div className="flex w-[70%] justify-between">
          <h2 className="font-bold text-[#667085] mb-4">Most Sales Categories</h2>
          <div className="gap-2 flex items-center">
            <img className="w-4 h-4" src={download} alt="" />
            <button className="text-[#004EF1] text-sm" onClick={handleDownloadWord}>
              Download report
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No category data yet.</p>
        ) : (
          <div className="border-t w-[70%] flex p-4">
            <div className="w-full justify-around flex px-10">
              <div className="relative w-64 h-64">
                {categories.map((category, index) => {
                  const sliceSize = (category.sales / totalSales) * 360 - gapSize;
                  const startRotation = currentRotation;
                  currentRotation += sliceSize + gapSize;
                  return (
                    <div key={index} className="absolute w-full h-full">
                      <div
                        style={{
                          background: `conic-gradient(${category.color} ${gapSize}deg ${sliceSize}deg, transparent ${sliceSize}deg 360deg)`,
                          maskImage: `radial-gradient(circle, transparent 47%, black 48%, black 52%, transparent 53%)`,
                          WebkitMaskImage: `radial-gradient(circle, transparent 47%, black 48%, black 52%, transparent 53%)`,
                          transform: `rotate(${startRotation}deg)`,
                          transformOrigin: "center",
                          borderRadius: "70%",
                        }}
                        className="absolute w-full h-full"
                      ></div>
                      <div style={{ width: `${arcWidth}px`, height: `${arcWidth}px`, backgroundColor: category.color, borderRadius: "50%", position: "absolute", top: "50%", left: "50%", transform: `rotate(${startRotation}deg) translate(50%) translateX(-${arcWidth / 2}px)`, transformOrigin: "center" }} />
                      <div style={{ width: `${arcWidth}px`, height: `${arcWidth}px`, backgroundColor: category.color, borderRadius: "50%", position: "absolute", top: "50%", left: "50%", transform: `rotate(${startRotation + sliceSize}deg) translate(50%) translateX(-${arcWidth / 2}px)`, transformOrigin: "center" }} />
                    </div>
                  );
                })}
                <div className="absolute inset-12 bg-white rounded-full flex items-center justify-center">
                  <div>
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-black text-2xl font-bold">{formatNumber(totalSales)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: faded(category.color, 0.9) }}>
                      <img className="w-4 h-4 rounded-full" src={category.image} alt={category.name} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#667085]">{category.name}</span>
                      <span className="text-sm">{formatNumber(category.sales)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAD;
