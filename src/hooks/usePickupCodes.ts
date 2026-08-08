import { useEffect, useRef, useState } from "react";
import api from "../utils/api";

export interface PickupEligibleOrder {
  _id?: string;
  status?: string;
  riderId?: string | null;
}

/**
 * An order is "awaiting pickup" when a rider is assigned and the store is
 * still preparing it (status "processing"). The server only serves the code
 * from the dedicated pickup-code endpoint in exactly this state.
 */
export function isAwaitingPickup(o: PickupEligibleOrder): boolean {
  return !!(o._id && o.riderId && o.status === "processing");
}

/**
 * Fetches pickup codes for orders currently awaiting pickup via the dedicated
 * endpoint GET /api/store/orders/:id/pickup-code.
 *
 * Codes are fetched ONCE per order and cached — polling callers (the Orders
 * page and the notification hook) would otherwise blow past the endpoint's
 * rate limit. Codes are dropped automatically the moment an order leaves the
 * awaiting-pickup state (i.e. it was verified / moved out for delivery).
 */
export function usePickupCodes(orders: PickupEligibleOrder[]) {
  const [codes, setCodes] = useState<Record<string, string>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  const awaiting = orders.filter(isAwaitingPickup);
  const awaitingKey = awaiting.map((o) => o._id).join("|");

  useEffect(() => {
    const awaitingIds = new Set(awaiting.map((o) => o._id));

    // Drop cached codes for orders that are no longer awaiting pickup.
    setCodes((prev) => {
      let changed = false;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (awaitingIds.has(k)) next[k] = v;
        else changed = true;
      }
      return changed ? next : prev;
    });

    const toFetch = awaiting.filter((o) => !fetchedRef.current.has(o._id!));
    if (toFetch.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const o of toFetch) {
        if (cancelled) break;
        try {
          const res = await api.get<{ pickupOTP: string }>(`/store/orders/${o._id}/pickup-code`);
          if (!cancelled) {
            setCodes((prev) => ({ ...prev, [o._id!]: res.data.pickupOTP }));
          }
        } catch {
          // The order may have just moved past pickup (verified, or the
          // order was handed over mid-poll) — skip it silently for now;
          // the code becomes irrelevant the moment it stops awaiting pickup.
        } finally {
          fetchedRef.current.add(o._id!);
        }
      }
    })();
    return () => { cancelled = true; };
    // awaitingKey is a stable string of ids — recomputed on every poll but
    // only re-fires the effect when the SET of awaiting orders changes.
  }, [awaitingKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return codes;
}

export default usePickupCodes;
