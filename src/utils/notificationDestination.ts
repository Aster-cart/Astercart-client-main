/**
 * notificationDestination.ts
 *
 * Single source of truth for turning a notification into the route the
 * user should be taken to. Both the Admin dashboard and the Store
 * dashboard consume these resolvers so navigation is centralized instead
 * of being hardcoded across every notification-rendering component.
 *
 * The backend notifications carry:
 *   type            — "order" | "payment" | "verification" | "withdrawal" | …
 *   referenceId     — the ObjectId of the entity the notification is about
 *   referenceModel  — "Transaction" | "Store" | "Rider" | "User" | "WithdrawalRequest"
 *
 * Admin dashboard is a single `/admin` route with an internal tab
 * (`?tab=<contentMap key>`), so admin destinations are `/admin?tab=…`
 * with the entity id appended as a query param for the target page to
 * highlight/scroll to. Store dashboard uses real sub-routes.
 */

export interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  seen: boolean;
  seenAt?: string | null;
  type?: string;
  referenceId?: string | null;
  referenceModel?: string | null;
}

export interface StoreNotification {
  id?: string;
  _id?: string;
  title?: string;
  message: string;
  createdAt?: string;
  timestamp?: string;
  seen?: boolean;
  read?: boolean;
  type?: string;
  referenceId?: string | null;
  referenceModel?: string | null;
  orderId?: string | null;
}

/** Tabs available in AdminAD.contentMap. */
export const ADMIN_TABS = {
  Dashboard: "Dashboard",
  Monitor: "Monitor",
  StoreManagement: "StoreManagement",
  UserManagement: "UserManagement",
  Orders: "Orders",
  UnassignedOrders: "UnassignedOrders",
  Payment: "Payment",
  Withdrawals: "Withdrawals",
  Payouts: "Payouts",
  FinancialLedger: "FinancialLedger",
  Revenue: "Revenue",
  Products: "Products",
  Pricing: "Pricing",
  Settings: "Settings",
  Analytics: "Analytics",
  Disputes: "Disputes",
  Riders: "Riders",
  Team: "Team",
  AuditLogs: "AuditLogs",
  Support: "Support",
} as const;

const ADMIN_TAB_BY_TYPE: Record<string, string> = {
  order: ADMIN_TABS.Orders,
  payment: ADMIN_TABS.Payment,
  transaction: ADMIN_TABS.Payment,
  delivery: ADMIN_TABS.Riders,
  withdrawal: ADMIN_TABS.Withdrawals,
  admin: ADMIN_TABS.Team,
};

function resolveAdminTab(n: AdminNotification): string {
  if (n.type === "verification") {
    return n.referenceModel === "Rider" ? ADMIN_TABS.Riders : ADMIN_TABS.StoreManagement;
  }
  if (n.type === "withdrawal" || n.referenceModel === "WithdrawalRequest") {
    return ADMIN_TABS.Withdrawals;
  }
  if (n.referenceModel === "Rider") return ADMIN_TABS.Riders;
  if (n.referenceModel === "Store") return ADMIN_TABS.StoreManagement;
  if (n.type && ADMIN_TAB_BY_TYPE[n.type]) return ADMIN_TAB_BY_TYPE[n.type];
  return ADMIN_TABS.Dashboard;
}

/**
 * Resolve the destination URL for an admin notification, e.g.
 *   `/admin?tab=Withdrawals&withdrawal=6a8c…`
 * Falls back to the admin home so a click never lands on a dead page.
 */
export function resolveAdminNotificationDestination(n: AdminNotification): string {
  const tab = resolveAdminTab(n);
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (n.referenceId) {
    if (n.type === "withdrawal" || n.referenceModel === "WithdrawalRequest") {
      params.set("withdrawal", n.referenceId);
    } else if (n.type === "order" || n.referenceModel === "Transaction") {
      params.set("orderId", n.referenceId);
    } else if (n.type === "verification") {
      params.set("verificationId", n.referenceId);
    }
  }
  return `/admin?${params.toString()}`;
}

/**
 * Resolve the destination route for a store notification.
 * Store order notifications land on the Orders page (there is no
 * order-detail route); verification ones land on the Verification tab.
 */
export function resolveStoreNotificationDestination(n: StoreNotification): string {
  const type = n.type;
  if (type === "pickup_otp" || type === "order") return "/orders";
  if (type === "verification") return "/verification";
  if (type === "payment" || type === "transaction") return "/withdrawals";
  if (type === "delivery") return "/orders";
  return "/";
}
