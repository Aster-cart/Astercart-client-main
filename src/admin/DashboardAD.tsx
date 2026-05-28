import { useEffect, useState } from "react";
import { green, red, Aster2, end, Aster3, beauty, elec, ent, fashion, food, health, hobbies, sport, download  } from "../assets/res";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from "docx";
import api from "../utils/api";

// Mock Data for Current Week
const currentWeekData = {
    totalOrders: 50000,
    activeUsers: 12000,
    newUsers: 2000,
    annualRevenue: 200000,
  };
  
  // Mock Data for Last Week (for calculating the change)
  const previousWeekData = {
    totalOrders: 45000,
    activeUsers: 11500,
    newUsers: 1800,
    annualRevenue: 195000,
  };
  
  interface Stat {
    label: string;
    value: number;
    image?: string;
    currentWeekTotal: number;
    previousWeekTotal: number;
  }
  
  const calculatePercentageChange = (currentTotal: number, previousTotal: number): number => {
    if (previousTotal === 0) return 0; // Avoid division by zero
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  };



  const topSalesProducts = [
    { name: 'Product 1', category: 'Category A', sold: 320, total: 1000, image: Aster2 },
    { name: 'Product 2', category: 'Category B', sold: 420, total: 1000, image: Aster2 },
    { name: 'Product 3', category: 'Category C', sold: 1000, total: 1000, image: Aster2 },
    { name: 'Product 4', category: 'Category D', sold: 950, total: 1000, image: Aster2 },
    { name: 'Product 5', category: 'Category E', sold: 450, total: 1000, image: Aster2 },
   ];
  
  const formatNumber = (num: number): string => {
    if (num >= 1000 && num < 1000000) {
      return `${(num / 1000).toFixed(1)}K`; // Include one decimal place
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    return num.toString();
  };

  
  
const DashboardAD = () => {
    const [stats, setStats] = useState<Stat[]>([]);
    const [topVisitedStores, setTopVisitedStores] = useState<
      { name: string; state: string; visits: number; image: string }[]
    >([
      { name: "Store A", state: "—", visits: 0, image: Aster3 },
    ]);

    const [showAllProducts, setShowAllProducts] = useState(false); // Toggle for showing all products
    const [showAllStores, setShowAllStores] = useState(false); // Toggle for showing all products
  
    const handleToggleProducts = () => {
      setShowAllProducts((prev) => !prev); // Toggle between showing 5 and all products
    };
    const handleToggleStores = () => {
      setShowAllStores((prev) => !prev); // Toggle between showing 5 and all products
    };
  
    // Display logic: Show either all products or the first 5 products
    const displayedProducts = showAllProducts
      ? topSalesProducts
      : topSalesProducts.slice(0, 5);
  
    const displayedStores = showAllStores
    ? topVisitedStores
    : topVisitedStores.slice(0, 5);
  

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{
          totalOrders: number;
          ordersThisWeek: number;
          ordersChangePct: number;
          activeUsers: number;
          newUsers: number;
          annualRevenue: number;
        }>("/dashboard/overview");

        const prevOrders = Math.max(0, data.ordersThisWeek - Math.round((data.ordersThisWeek * data.ordersChangePct) / 100));

        setStats([
          {
            label: "Total Orders",
            value: data.totalOrders,
            image: green,
            currentWeekTotal: data.ordersThisWeek,
            previousWeekTotal: prevOrders,
          },
          {
            label: "Active Users",
            value: data.activeUsers,
            image: red,
            currentWeekTotal: data.activeUsers,
            previousWeekTotal: data.activeUsers,
          },
          {
            label: "New Users",
            value: data.newUsers,
            image: green,
            currentWeekTotal: data.newUsers,
            previousWeekTotal: 0,
          },
          {
            label: "Revenue (paid orders)",
            value: data.annualRevenue,
            image: red,
            currentWeekTotal: data.annualRevenue,
            previousWeekTotal: data.annualRevenue * 0.9,
          },
        ]);

        const visited = await api.get("/dashboard/topvisited");
        if (visited.data?.topVisitedStores?.length) {
          setTopVisitedStores(
            visited.data.topVisitedStores.map((s: { storeName?: string; totalOrders?: number; state?: string }) => ({
              name: s.storeName || "Store",
              state: s.state || "—",
              visits: s.totalOrders || 0,
              image: Aster3,
            }))
          );
        }
      } catch {
        setStats([]);
      }
    })();
  }, []);

  
  const categories = [
    { name: 'Electronics', sales: 5000, color: '#004EF1', image: elec },
    { name: 'Entertainment', sales: 3000, color: '#01C0F6', image: ent },
    { name: 'Beauty', sales: 2000, color: '#DFDC27', image: beauty },
    { name: 'Fashion', sales: 4000, color: '#033270', image: fashion },
    { name: 'Food', sales: 1500, color: '#D4A276', image: food },
    { name: 'Health Care', sales: 1000, color: '#FF8000', image: health },
    { name: 'Sports', sales: 1800, color: '#F26A4F', image: sport },
    { name: 'Hobbies', sales: 500, color: '#5BC0BE', image: hobbies },
  ];

  const handleDownloadWord = () => {
    // Example category data
    const categories = [
      { name: "Electronics", sales: 1500, color: "#FF5733" },
      { name: "Clothing", sales: 1200, color: "#33FF57" },
      { name: "Home Goods", sales: 800, color: "#3357FF" },
    ];
  
    // Create rows for the table
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Category")] }),
          new TableCell({ children: [new Paragraph("Sales")] }),
          new TableCell({ children: [new Paragraph("Color")] }),
        ],
      }),
      ...categories.map(
        (category) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(category.name)] }),
              new TableCell({ children: [new Paragraph(category.sales.toString())] }),
              new TableCell({ children: [new Paragraph(category.color)] }),
            ],
          })
      ),
    ];
  
    // Create the Word document
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Most Sold Categories",
              heading: "Heading1",
            }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });
  
    // Generate the Word document and trigger download
    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "most_sold_categories.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };
  
  
  

 // Helper function to fade a color towards white by adjusting its opacity
const faded = (hexColor: string, intensity: number): string => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust the color towards white based on intensity
  const fade = (color: number): number => Math.round(color + (255 - color) * intensity);

  return `rgb(${fade(r)}, ${fade(g)}, ${fade(b)})`;
};


  
const totalSales = categories.reduce((sum, category) => sum + category.sales, 0);
const gapSize = 3; // Gap between slices (degrees)
const arcWidth = 10; // Thickness of the donut chart
let currentRotation = 0;


  return (
    <div className="pb-8">
            <section className="grid grid-cols-4 gap-6 mb-6">
      {stats.map((stat: Stat, index: number) => {
        const percentageChange = calculatePercentageChange(stat.currentWeekTotal, stat.previousWeekTotal);

        // Sample data for the graph
        const sampleData = [
          { name: 'Mon', value: stat.currentWeekTotal },
          { name: 'Tue', value: stat.currentWeekTotal * 0.8 },
          { name: 'Wed', value: stat.currentWeekTotal * 1.1 },
          { name: 'Thu', value: stat.currentWeekTotal * 1.3 },
          { name: 'Fri', value: stat.currentWeekTotal * 0.9 },
        ];

        return (
          <div key={index} className="p-4 border flex-col rounded-2xl flex">
            <p className="text-[#667085] text-base font-semibold ">{stat.label}</p>

            {/* Graph showing current week's data */}
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sampleData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={index % 2 === 0 ? '#32D583' : '#F97066'} // Green for even, Red for odd
                  strokeWidth={2}
                  dot={false} // Disables dots
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Display the current value and percentage change */}
            <div className=' flex gap-3'>
            {stat.image && <img src={stat.image} alt={stat.label}  />}
              <p className="text-lg font-semibold">{stat.value}</p>
              <p
  className={`text-xs mb-3 ${index % 2 === 0 ? 'text-[#027A48]' : 'text-[#912018]'}`}
>
  {percentageChange > 0
    ? `+${percentageChange.toFixed(2)}%`
    : `${percentageChange.toFixed(2)}%`}
</p>
            </div>
<p className='text-xs text-[#667085]'>Compared from Last Week</p>
          </div>
        );
      })}
    </section>

    <div className="flex gap-4">
      {/* Top Sales Products */}
      <div className="bg-white p-4 rounded-2xl border w-1/2">
        <h2 className="font-bold  text-[#667085] mb-4">Top Sales Products</h2>
        <div className="border-b mb-4"></div>
        {displayedProducts.map((product, index) => {
          const percentage = (product.sold / product.total) * 100;
          const barColor = index % 2 === 0 ? 'bg-[#553AFE]' : 'bg-[#01C0F6]';

          return (
            <div key={index} className="mb-4 ">
              <div className="flex items-center  gap-2">
                <img className="w-8 h-8 rounded" src={product.image} alt={product.name} />
                <div className="flex flex-col w-full">
                  <p className="text-sm text-[#667085]">{product.name} </p>
                  <div className='flex justify-between'>
                  <p  className="text-xs text-[#667085]">{product.category}</p>
                  <span className="text-sm ml-2">{product.sold} pcs</span>
                  </div>
                </div>
              </div>
              <div className="relative w-full h-1 gap-3 bg-gray-200 rounded-full">
          {/* Filled Bar */}
          <div
            className={`${barColor} h-1 rounded-full`}
            style={{
              width: `${percentage}%`, // Filled portion
              marginRight: '8px', // Creates the gap
            }}
          ></div>
          {/* Gap */}
          {percentage < 100 && (
            <div
              className="absolute top-0 rounded-full right-0 h-1"
              style={{
                left: `${percentage}%`,
                width: '4px', // Width of the gap
                backgroundColor: '#ffffff', // Match background color
              }}
            ></div>
          )}
        </div>
            </div>
          );
        })}
     {/* Toggle Button */}
     <div className="flex justify-end border-t  mt-6 gap-3">
        <button
          onClick={handleToggleProducts}
          className="text-xs mt-4 text-[#004EF1]"
        >
          {showAllProducts ? 'Show Less' : 'View Full Report'}
        </button>
        <img className="mt-4" src={end} alt="" />
      </div>

      </div>

      {/* Top Visited Stores */}
      <div className="bg-white p-4 rounded-2xl border w-1/2">
        <h2 className="font-bold mb-4 text-[#667085]">Top Visited Stores</h2>
        <div className="border-b mb-4"></div>
        {displayedStores.map((store, index) => {
          const maxVisits = Math.max(...topVisitedStores.map(store => store.visits));
          const percentage = (store.visits / maxVisits) * 100;
          const barColor = index % 2 === 0 ? 'bg-[#553AFE]' : 'bg-[#01C0F6]';

          return (
            <div key={index} className="mb-4">
              <div className="flex items-center gap-2">
                <img className="w-8 h-8 rounded" src={store.image} alt={store.name} />
                <div className="flex flex-col w-full">
                  <p className="text-sm text-[#667085]">{store.name} </p>
                  <div className='flex justify-between'>
                  <p  className="text-xs text-[#667085]">{store.state}</p>
                  <span className="text-sm ml-2">{formatNumber(store.visits)} visits</span>
                  </div>
                </div>
              </div>
              <div className="relative w-full h-1 bg-gray-200 rounded-full">
              <div className="relative w-full h-1 gap-3 bg-gray-200 rounded-full">
          {/* Filled Bar */}
          <div
            className={`${barColor} h-1 rounded-full`}
            style={{
              width: `${percentage}%`, // Filled portion
              marginRight: '4px', // Creates the gap
            }}
          ></div>
          {/* Gap */}
          {percentage < 100 && (
            <div
              className="absolute top-0 rounded-full right-0 h-1"
              style={{
                left: `${percentage}%`,
                width: '8px', // Width of the gap
                backgroundColor: '#ffffff', // Match background color
              }}
            ></div>
          )}
        </div>
              </div>
            </div>
          );
        })}
      
  {/* Toggle Button */}
  <div className="flex justify-end  border-t   gap-3 mt-6">
        <button
          onClick={handleToggleStores}
          className="text-xs mt-4 text-[#004EF1]"
        >
          {showAllStores ? 'Show Less' : 'View Full Report'}
        </button>
          <img className="mt-4" src={end} alt="" />
      </div>

      </div>
    </div>

    <div className='border rounded-2xl   mt-6 p-4'>
      <div className="flex w-[70%] justify-between">
      <h2 className="font-bold  text-[#667085] mb-4">Most Sales Categories</h2>
      <div className="gap-2  flex items-center">
        <img className="w-4 h-4 items-center" src={download} alt="" />
      <button
      className="text-[#004EF1] text-sm"
   onClick={handleDownloadWord}
      >Download report
      </button>
      </div>

      </div>
          <div className="border-t w-[70%] flex p-4 ">

      {/* Donut Chart */}
      <div className="w-full justify-around flex px-10">
      <div className="relative w-64 h-64">
      {categories.map((category, index) => {
        const sliceSize = (category.sales / totalSales) * 360 - gapSize;
        const startRotation = currentRotation;
        currentRotation += sliceSize + gapSize;

        return (
          <div key={index} className="absolute w-full h-full">
          {/* Slice */}
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

          {/* Rounded Start */}
          <div
            style={{
              width: `${arcWidth}px`,
              height: `${arcWidth}px`,
              backgroundColor: category.color,
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `rotate(${startRotation}deg) translate(50%) translateX(-${arcWidth / 2}px)`,
              transformOrigin: "center",
            }}
          />

          {/* Rounded End */}
          <div
            style={{
              width: `${arcWidth}px`,
              height: `${arcWidth}px`,
              backgroundColor: category.color,
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `rotate(${startRotation + sliceSize}deg) translate(50%) translateX(-${arcWidth / 2}px)`,
              transformOrigin: "center",
            }}
          />
        </div>
        );
      })}

      {/* Inner Circle */}
      <div className="absolute inset-12 bg-white rounded-full flex items-center tex justify-center">
        <div>
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-black text-2xl font-bold">{`${(totalSales / 1000).toFixed(2)}K`}</p>
        </div>
      </div>
    </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center space-x-2">
<div
  className="w-8 h-8 rounded-full flex items-center justify-center"
  style={{
    backgroundColor: faded(category.color, 0.9), // Adjust the intensity for fading
  }}
>
  <img className="w-4 h-4 rounded-full" src={category.image} alt={category.name} />
</div>




  <div className='flex flex-col'>
           <span className="text-sm text-[#667085]">{category.name}</span>
              <span className="text-sm ">
                {formatNumber(category.sales)}
              </span>
           </div>
          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
    </div>
  )
}

export default DashboardAD
