import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const formatNaira = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

type LedgerView = "commercial" | "cash" | "profit" | "checkouts";

interface CommercialRow {
  orderId: string;
  storeName: string;
  customerName: string;
  date: string;
  grossCustomerPayment: number;
  productTotal: number;
  deliveryFee: number;
  productMarkupRevenue: number;
  customerServiceFee: number;
  serviceFeeGatewayEstimate: number; // previously invisible — what's set aside for the gateway, NOT Astercart's money
  serviceFeeRevenue: number;          // previously invisible — what's actually left, IS Astercart's money
  storeSubtotal: number;
  storeCommission: number;
  deliveryCommission: number;
  riderEarnings: number;
  finalStorePayout: number;
  totalAstercartRevenueBeforeExpenses: number;
  payoutStatus: string;
  status: string;
}

interface CashRow {
  orderId: string;
  storeName: string;
  date: string;
  grossCustomerPayment: number;
  gatewayFeeCharged: number | null;
  netSettlementReceived: number | null;
  refundAmount: number;
  manualAdjustmentAmount: number;
  manualAdjustmentReason: string | null;
  storePayoutSent: number;
  riderPayoutSent: number;
  remainingCashBalance: number | null;
  settlementStatus: "pending" | "settled" | "failed" | "reversed";
  settlementDate: string | null;
  payoutStatus: string;
  status: string;
}

interface ProfitRow {
  orderId: string;
  storeName: string;
  date: string;
  grossRevenue: number;
  revenueBreakdown: { markupRevenue: number; serviceFeeRevenue: number; storeCommission: number; deliveryCommission: number };
  gatewayFeeExpense: number;
  gatewayFeeIsEstimate: boolean;
  refundCostExpense: number;
  manualAdjustmentExpense: number;
  totalExpenses: number;
  netProfit: number;
  status: string;
}

const SETTLEMENT_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  settled: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  reversed: "bg-orange-100 text-orange-700",
};

const FinancialLedgerAD: React.FC = () => {
  const [view, setView] = useState<LedgerView>("commercial");
  const [loading, setLoading] = useState(true);

  const [commercialRows, setCommercialRows] = useState<CommercialRow[]>([]);
  const [commercialSummary, setCommercialSummary] = useState<any>(null);

  const [cashRows, setCashRows] = useState<CashRow[]>([]);
  const [cashSummary, setCashSummary] = useState<any>(null);

  const [profitRows, setProfitRows] = useState<ProfitRow[]>([]);
  const [profitSummary, setProfitSummary] = useState<any>(null);

  const [gatewayComparison, setGatewayComparison] = useState<any>(null);
  const [checkouts, setCheckouts] = useState<any[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const [commercialRes, cashRes, profitRes, gatewayRes, checkoutsRes] = await Promise.all([
        api.get<{ rows: CommercialRow[]; summary: any }>(`/admin/ledger/commercial${qs}`),
        api.get<{ rows: CashRow[]; summary: any }>(`/admin/ledger/cash${qs}`),
        api.get<{ rows: ProfitRow[]; summary: any }>(`/admin/ledger/profit${qs}`),
        api.get<any>(`/admin/ledger/gateway-cost-comparison${qs}`),
        api.get<{ checkouts: any[] }>(`/admin/ledger/checkouts${qs}`),
      ]);

      setCommercialRows(commercialRes.data.rows || []);
      setCommercialSummary(commercialRes.data.summary);
      setCashRows(cashRes.data.rows || []);
      setCashSummary(cashRes.data.summary);
      setProfitRows(profitRes.data.rows || []);
      setProfitSummary(profitRes.data.summary);
      setGatewayComparison(gatewayRes.data);
      setCheckouts(checkoutsRes.data.checkouts || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load financial ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="font-inter">
      {/* Explainer — the core principle of this entire page */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <strong>Three different financial concepts, never mixed:</strong> Commercial (who earned what,
        by Astercart's own business rules), Cash (what money actually moved through Flutterwave and the
        bank account), and Profit (Commercial revenue minus real operating costs like gateway fees and
        refunds). Each tab below is a completely separate view — none of them recompute or borrow numbers
        from the others.
      </div>

      {/* Date filter */}
      <div className="flex gap-3 mb-4 items-end">
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry" />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry" />
        </div>
        <button onClick={load} className="px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium">
          Apply filter
        </button>
        {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(""); setToDate(""); load(); }}
            className="px-4 py-2 text-gray-500 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* View tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {([
          { key: "commercial", label: "Commercial View", sub: "Who earned what" },
          { key: "cash", label: "Cash View", sub: "What money actually moved" },
          { key: "profit", label: "Profit View", sub: "How much Astercart actually made" },
          { key: "checkouts", label: "Grouped Checkouts", sub: "Multi-store orders from one payment" },
        ] as { key: LedgerView; label: string; sub: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-4 py-3 text-left border-b-2 transition ${
              view === tab.key ? "border-pry" : "border-transparent"
            }`}
          >
            <p className={`text-sm font-semibold ${view === tab.key ? "text-pry" : "text-gray-600"}`}>{tab.label}</p>
            <p className="text-xs text-gray-400">{tab.sub}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading financial ledger...</p>
      ) : (
        <>
          {view === "commercial" && (
            <CommercialView rows={commercialRows} summary={commercialSummary} />
          )}
          {view === "cash" && (
            <CashView rows={cashRows} summary={cashSummary} />
          )}
          {view === "profit" && (
            <ProfitView rows={profitRows} summary={profitSummary} gatewayComparison={gatewayComparison} onSettled={load} />
          )}
          {view === "checkouts" && (
            <CheckoutsView checkouts={checkouts} />
          )}
        </>
      )}
    </div>
  );
};

// ─── Commercial View ────────────────────────────────────────────────────────
const CommercialView: React.FC<{ rows: CommercialRow[]; summary: any }> = ({ rows, summary }) => (
  <div>
    {summary && (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Gross customer payments" value={formatNaira(summary.grossCustomerPayments)} />
        <SummaryCard label="Total markup revenue" value={formatNaira(summary.totalMarkupRevenue)} color="text-teal-600" />
        <SummaryCard label="Total service fee revenue" value={formatNaira(summary.totalServiceFeeRevenue)} color="text-orange-600" />
        <SummaryCard label="Total store commission" value={formatNaira(summary.totalStoreCommission)} color="text-purple-600" />
        <SummaryCard label="Total delivery commission" value={formatNaira(summary.totalDeliveryCommission)} color="text-pink-600" />
        <SummaryCard label="Total rider payouts" value={formatNaira(summary.totalRiderPayouts)} color="text-blue-500" />
        <SummaryCard label="Total store payouts" value={formatNaira(summary.totalStorePayouts)} color="text-green-600" />
        <SummaryCard label="Total Astercart revenue" value={formatNaira(summary.totalAstercartRevenue)} color="text-gray-900" bold />
      </div>
    )}

    <p className="text-xs text-gray-400 mb-2 px-1">
      Columns follow the money chronologically: what the customer paid → what that splits into → what each
      split breaks down into → what Astercart actually keeps. Every subtraction is its own visible column —
      nothing is hidden inside a final total.
    </p>

    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="text-gray-400 border-b text-xs">
          <tr>
            <th className="py-3 px-4 text-left" rowSpan={2}>Order</th>
            <th className="px-3 text-left" rowSpan={2}>Store</th>
            <th className="px-3" rowSpan={2}>Gross Paid</th>
            <th className="px-3 text-center bg-gray-50" colSpan={3}>Splits into</th>
            <th className="px-3 text-center bg-teal-50" colSpan={2}>Product Total breaks into</th>
            <th className="px-3 text-center bg-purple-50" colSpan={2}>Store Subtotal generates</th>
            <th className="px-3 text-center bg-pink-50" colSpan={2}>Delivery Fee generates</th>
            <th className="px-3 text-center bg-orange-50" colSpan={2}>Service Fee splits into</th>
            <th className="px-3 font-semibold text-center bg-gray-900 text-white" rowSpan={2}>Astercart<br/>Revenue</th>
          </tr>
          <tr>
            <th className="px-3 font-normal">Product Total</th>
            <th className="px-3 font-normal">Delivery Fee</th>
            <th className="px-3 font-normal">Service Fee</th>
            <th className="px-3 font-normal bg-teal-50">Store Subtotal</th>
            <th className="px-3 font-normal bg-teal-50">Markup</th>
            <th className="px-3 font-normal bg-purple-50">Commission</th>
            <th className="px-3 font-normal bg-purple-50">Store Payout</th>
            <th className="px-3 font-normal bg-pink-50">Delivery Comm.</th>
            <th className="px-3 font-normal bg-pink-50">Rider Earnings</th>
            <th className="px-3 font-normal bg-orange-50">Gateway Estimate</th>
            <th className="px-3 font-normal bg-orange-50">Service Fee Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={14} className="py-8 text-center text-gray-400">No transactions in this period.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.orderId} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono text-xs">{(r.orderId || "").slice(-8).toUpperCase()}</td>
              <td className="px-3">{r.storeName}</td>
              <td className="px-3 font-bold">{formatNaira(r.grossCustomerPayment)}</td>
              <td className="px-3">{formatNaira(r.productTotal)}</td>
              <td className="px-3 text-blue-500">{formatNaira(r.deliveryFee)}</td>
              <td className="px-3 text-orange-600">{formatNaira(r.customerServiceFee)}</td>
              <td className="px-3 bg-teal-50/40">{formatNaira(r.storeSubtotal)}</td>
              <td className="px-3 bg-teal-50/40 text-teal-600">{formatNaira(r.productMarkupRevenue)}</td>
              <td className="px-3 bg-purple-50/40 text-purple-600">{formatNaira(r.storeCommission)}</td>
              <td className="px-3 bg-purple-50/40 text-green-600">{formatNaira(r.finalStorePayout)}</td>
              <td className="px-3 bg-pink-50/40 text-pink-600">{formatNaira(r.deliveryCommission)}</td>
              <td className="px-3 bg-pink-50/40 text-blue-500">{formatNaira(r.riderEarnings)}</td>
              <td className="px-3 bg-orange-50/40 text-gray-500">−{formatNaira(r.serviceFeeGatewayEstimate)}</td>
              <td className="px-3 bg-orange-50/40 text-orange-600 font-medium">{formatNaira(r.serviceFeeRevenue)}</td>
              <td className="px-3 font-bold text-gray-900 bg-gray-50">{formatNaira(r.totalAstercartRevenueBeforeExpenses)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Cash View ──────────────────────────────────────────────────────────────
const CashView: React.FC<{ rows: CashRow[]; summary: any }> = ({ rows, summary }) => (
  <div>
    {summary && (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Gross customer payments" value={formatNaira(summary.grossCustomerPayments)} />
        <SummaryCard label="Total gateway fees paid" value={formatNaira(summary.totalGatewayFeesPaid)} color="text-red-600" />
        <SummaryCard label="Total net settlements received" value={formatNaira(summary.totalNetSettlementsReceived)} color="text-green-600" />
        <SummaryCard label="Total refunds" value={formatNaira(summary.totalRefunds)} color="text-orange-600" />
        <SummaryCard label="Total manual adjustments" value={formatNaira(summary.totalManualAdjustments)} />
        <SummaryCard label="Total store payouts sent" value={formatNaira(summary.totalStorePayoutsSent)} color="text-blue-600" />
        <SummaryCard label="Settlements: settled" value={summary.settlementsSettled} color="text-green-600" />
        <SummaryCard label="Settlements: pending" value={summary.settlementsPending} color="text-yellow-600" />
      </div>
    )}

    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="text-gray-400 border-b text-xs">
          <tr>
            <th className="py-3 px-4 text-left">Order</th>
            <th className="px-3 text-left">Store</th>
            <th className="px-3">Charged Amount</th>
            <th className="px-3">Gateway Fee</th>
            <th className="px-3">Net Settlement</th>
            <th className="px-3">Refunds</th>
            <th className="px-3">Adjustments</th>
            <th className="px-3">Store Payout Sent</th>
            <th className="px-3">Remaining Balance</th>
            <th className="px-3">Settlement Status</th>
            <th className="px-3">Settlement Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={11} className="py-8 text-center text-gray-400">No transactions in this period.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.orderId} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono text-xs">{(r.orderId || "").slice(-8).toUpperCase()}</td>
              <td className="px-3">{r.storeName}</td>
              <td className="px-3 font-bold">{formatNaira(r.grossCustomerPayment)}</td>
              <td className="px-3 text-red-500">{formatNaira(r.gatewayFeeCharged)}</td>
              <td className="px-3 text-green-600">{formatNaira(r.netSettlementReceived)}</td>
              <td className="px-3 text-orange-500">{r.refundAmount ? formatNaira(r.refundAmount) : "—"}</td>
              <td className="px-3">{r.manualAdjustmentAmount ? formatNaira(r.manualAdjustmentAmount) : "—"}</td>
              <td className="px-3 text-blue-600">{formatNaira(r.storePayoutSent)}</td>
              <td className="px-3 font-medium">{formatNaira(r.remainingCashBalance)}</td>
              <td className="px-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${SETTLEMENT_COLOR[r.settlementStatus]}`}>
                  {r.settlementStatus}
                </span>
              </td>
              <td className="px-3 text-xs text-gray-500">
                {r.settlementDate ? new Date(r.settlementDate).toLocaleDateString("en-GB") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Profit View ────────────────────────────────────────────────────────────
const ProfitView: React.FC<{
  rows: ProfitRow[]; summary: any; gatewayComparison: any; onSettled: () => void;
}> = ({ rows, summary, gatewayComparison }) => (
  <div>
    {/* The headline figure — Net Platform Revenue, genuinely different from Commercial Revenue */}
    {summary && (
      <div className="bg-gray-900 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-300">Platform Revenue (gross)</p>
            <p className="text-2xl font-bold text-white mt-1">{formatNaira(summary.grossRevenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Gateway Cost</p>
            <p className="text-2xl font-bold text-red-400 mt-1">−{formatNaira(summary.totalGatewayFeeExpense)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Net Platform Revenue</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{formatNaira(summary.netPlatformProfit)}</p>
          </div>
        </div>
        {summary.transactionsUsingEstimatedGatewayFee > 0 && (
          <p className="text-xs text-yellow-400 mt-3">
            ⚠ {summary.transactionsUsingEstimatedGatewayFee} transaction(s) above use an ESTIMATED gateway
            fee (real settlement not yet confirmed) — actual profit may shift slightly once settled.
          </p>
        )}
      </div>
    )}

    {/* Gateway cost rate — configured vs actual, the management tool */}
    {gatewayComparison && (
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-semibold mb-3">Gateway Cost Rate — Configured vs Actual</h3>
        {gatewayComparison.sampleSize === 0 ? (
          <p className="text-sm text-gray-400">{gatewayComparison.recommendation}</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400">Configured</p>
                <p className="text-lg font-bold">{gatewayComparison.configuredRatePercent}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Actual average</p>
                <p className="text-lg font-bold">{gatewayComparison.actualAverageRatePercent}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Difference</p>
                <p className={`text-lg font-bold ${gatewayComparison.differencePercent > 0 ? "text-red-600" : "text-green-600"}`}>
                  {gatewayComparison.differencePercent > 0 ? "+" : ""}{gatewayComparison.differencePercent}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{gatewayComparison.recommendation}</p>
            <p className="text-xs text-gray-400 mt-2">Based on {gatewayComparison.sampleSize} settled transaction(s) with a confirmed real gateway fee.</p>
          </>
        )}
      </div>
    )}

    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="text-gray-400 border-b text-xs">
          <tr>
            <th className="py-3 px-4 text-left">Order</th>
            <th className="px-3 text-left">Store</th>
            <th className="px-3">Gross Revenue</th>
            <th className="px-3">Gateway Fee</th>
            <th className="px-3">Refund Cost</th>
            <th className="px-3">Adjustments</th>
            <th className="px-3">Total Expenses</th>
            <th className="px-3 font-semibold">Net Profit</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={8} className="py-8 text-center text-gray-400">No transactions in this period.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.orderId} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono text-xs">{(r.orderId || "").slice(-8).toUpperCase()}</td>
              <td className="px-3">{r.storeName}</td>
              <td className="px-3 font-bold">{formatNaira(r.grossRevenue)}</td>
              <td className="px-3 text-red-500">
                {formatNaira(r.gatewayFeeExpense)}
                {r.gatewayFeeIsEstimate && <span className="text-xs text-yellow-500 ml-1">(est.)</span>}
              </td>
              <td className="px-3 text-orange-500">{r.refundCostExpense ? formatNaira(r.refundCostExpense) : "—"}</td>
              <td className="px-3">{r.manualAdjustmentExpense ? formatNaira(r.manualAdjustmentExpense) : "—"}</td>
              <td className="px-3">{formatNaira(r.totalExpenses)}</td>
              <td className={`px-3 font-bold ${r.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatNaira(r.netProfit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Grouped Checkouts View ─────────────────────────────────────────────────
// Direct fix for a real gap: when a customer orders from multiple stores in
// one cart, each store gets its own separate order — but only ONE combined
// amount is ever actually charged via Flutterwave. Looking at individual
// orders in isolation never lets admin see "this customer's ₦32,128 payment
// was split into these 2 store orders" — this view makes that link explicit
// and visible, instead of it only existing internally for fee-splitting math.
const CheckoutsView: React.FC<{ checkouts: any[] }> = ({ checkouts }) => {
  const multiStoreCheckouts = checkouts.filter((c) => c.storeCount > 1);
  const singleStoreCheckouts = checkouts.filter((c) => c.storeCount === 1);

  return (
    <div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-sm text-purple-800">
        When a customer orders from multiple stores in one cart, each store gets its own separate order
        with its own delivery fee, service fee, and commission — but Flutterwave only ever charges ONE
        combined amount for the whole checkout. This view groups those split orders back together so you
        can see exactly which orders came from the same payment, and confirms the split amounts actually
        add up to what was really charged.
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <SummaryCard label="Multi-store checkouts (split across 2+ stores)" value={multiStoreCheckouts.length} color="text-purple-600" />
        <SummaryCard label="Single-store checkouts" value={singleStoreCheckouts.length} />
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b text-xs">
            <tr>
              <th className="py-3 px-4 text-left">Customer</th>
              <th className="px-3 text-left">Date</th>
              <th className="px-3 text-left">Stores in this checkout</th>
              <th className="px-3">Combined Total Charged</th>
              <th className="px-3">Reconciliation</th>
            </tr>
          </thead>
          <tbody>
            {checkouts.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No checkouts in this period.</td></tr>
            ) : checkouts.map((c) => (
              <tr key={c.checkoutReference} className={`border-b hover:bg-gray-50 ${c.storeCount > 1 ? "bg-purple-50/30" : ""}`}>
                <td className="py-3 px-4">{c.customerName}</td>
                <td className="px-3 text-xs text-gray-500">{new Date(c.date).toLocaleDateString("en-GB")}</td>
                <td className="px-3">
                  <div className="flex flex-col gap-1">
                    {c.stores.map((s: any) => (
                      <div key={s.orderId} className="flex items-center gap-2">
                        <span className="font-medium">{s.storeName}</span>
                        <span className="text-xs text-gray-400">{formatNaira(s.grandTotal)}</span>
                        {c.storeCount > 1 && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">split</span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 font-bold text-center">{formatNaira(c.combinedGrandTotal)}</td>
                <td className="px-3 text-center">
                  {c.reconciliationDifference == null ? (
                    <span className="text-xs text-gray-400">Awaiting settlement</span>
                  ) : Math.abs(c.reconciliationDifference) < 1 ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">✓ Matches</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      ⚠ Off by {formatNaira(Math.abs(c.reconciliationDifference))}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string | number; color?: string; bold?: boolean }> = ({ label, value, color, bold }) => (
  <div className="bg-white rounded-xl p-4 border">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-xl font-bold mt-1 ${color || ""} ${bold ? "text-2xl" : ""}`}>{value}</p>
  </div>
);

export default FinancialLedgerAD;
