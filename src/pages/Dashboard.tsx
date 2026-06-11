import { search } from "../assets/res";
import { useDashboard } from "../hooks/useDashboard";

type TableRow = {
  id: string;
  user: string;
  transactionId: string;
  productName: string;
  price: string;   // already formatted
  fee: string;     // already formatted
  qty: number;
  discount: string; // already formatted
  taxRate: string;  // e.g. "5%"
  createdAt?: string;
};

const Dashboard: React.FC = () => {
  const {
    mockDashboardData,            // { transactions, amountMade, totalFeesCharged }
    mockAllTransactionData,       // { allTransactions }
    selectedFilter,
    setSelectedFilter,
    isOpen,
    setIsOpen,
    searchQuery,
    handleSearchChange,
    filteredTransactions,         // <-- already an array<TableRow>
  } = useDashboard();

  // Our table rows are already prepared by the hook
  const tableRows: TableRow[] = filteredTransactions;

  // Keep your additional frontend search exactly as before
  const visibleRows = tableRows.filter(
    (r) =>
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Dashboard Stats */}
      <div className="flex w-full font-inter justify-between py-2">
        <div className="flex flex-col  justify-between p-3 border bg-white border-fade rounded-lg h-[70px] w-[432px] mx-1">
          <span className="text-sm leading-4">All Transaction</span>
          <span className="font-medium text-xl leading-7">
            {mockDashboardData.transactions}
          </span>
        </div>
        <div className="flex flex-col  bg-white border-fade rounded-lg border h-[70px]  justify-between p-3 w-[432px] mx-1">
          <span className="text-sm leading-4">Gross Revenue (₦)</span>
          <span className="font-medium text-xl leading-7">
            {mockDashboardData.amountMade}
          </span>
        </div>
        <div className="flex flex-col  bg-white border-fade rounded-lg border  h-[70px] justify-between p-3 w-[432px] mx-1">
          <span className="text-sm leading-4">Your Store Payout (after 10% fee)</span>
          <span className="font-medium text-xl leading-7">
            {mockDashboardData.totalFeesCharged}
          </span>
        </div>
        <div className="flex flex-col justify-between p-3 border bg-white border-fade rounded-lg h-[70px] w-[432px] mx-1">
          <span className="text-sm leading-4 text-gray-600">Platform Fee (10%)</span>
          <span className="font-medium text-xl leading-7 text-orange-600">
            {(mockDashboardData as any).platformFee || "₦0"}
          </span>
        </div>
      </div>

      {/* Transaction Table Section */}
      <div className="mt-1 mx-2 p-2 py-3 font-inter bg-white rounded-2xl">
        <div className="flex justify-between mb-4">
          <div className="flex w-[20%] text-center justify-between items-center ">
            <h2 className="text-base leading-6 pr-2 font-semibold">
              All Transactions
            </h2>
            <span className="bg-pry rounded text-white px-2">
              {mockAllTransactionData.allTransactions}
            </span>
          </div>

          <div className="flex justify-between w-[70%]">
            {/* Search Bar */}
            <div className="w-[50%] relative">
              <div className="absolute left-3 top-5 transform -translate-y-1/2">
                <img src={search} alt="search icon" className="w-4 h-4" />
              </div>

              {/* Search Input */}
              <input
                type="search"
                placeholder="Search ..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-400 font-medium text-xs sm:text-sm border-gray-300 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="">
              {/* Dropdown Button */}
              <button
                className="bg-bginput text-[#434343] rounded-md px-2 py-2 flex items-center space-x-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span>{selectedFilter}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute bg-white border border-gray-300 rounded-md mt-2 w-[200px] shadow-lg">
                  <ul className="py-2">
                    <li
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-fade hover:mx-2 hover:rounded-lg"
                      onClick={() => {
                        setSelectedFilter("All Transactions");
                        setIsOpen(false);
                      }}
                    >
                      All Transactions
                    </li>
                    <li
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-fade hover:mx-2 hover:rounded-lg"
                      onClick={() => {
                        setSelectedFilter("Recent Transaction");
                        setIsOpen(false);
                      }}
                    >
                      Recent Transaction
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Apply Filter Button */}
            <div>
              <button className="bg-black text-white rounded-md px-4 py-2">
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Table Displaying Transaction Data */}
        <table className="w-full table-auto border-collapse">
          <thead className="text-xs text-left text-[#7B7B7B] border-b py-3 gap-2 leading-4 font-normal">
            <tr>
              <th className="px-2 py-3">S/N</th>
              <th className="px-2 py-3">User</th>
              <th className="px-2 py-3">Transaction ID</th>
              <th className="px-2 py-3">Product Name</th>
              <th className="px-2 py-3">Price</th>
              <th className="px-2 py-3">Fee</th>
              <th className="px-2 py-3">Qty</th>
              <th className="px-2 py-3">Discount</th>
              <th className="px-2 py-3">Tax Rate</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={row.id} className="border-b text-xs gap-2 leading-4 font-normal border-gray-300">
                <td className="px-2 py-3">{String(index + 1).padStart(2, "0")}</td>
                <td className="px-2 py-3">{row.user}</td>
                <td className="px-2 py-3">{row.transactionId}</td>
                <td className="px-2 py-3">{row.productName}</td>
                <td className="px-2 py-3">{row.price}</td>
                <td className="px-2 py-3">{row.fee}</td>
                <td className="px-2 py-3">{row.qty}</td>
                <td className="px-2 py-3">{row.discount}</td>
                <td className="px-2 py-3">{row.taxRate}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default Dashboard;
