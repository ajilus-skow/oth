import type { CartLine } from "./cartDomain";

export type LocalOrderReceipt = {
  lines: Array<{
    lineTotalCents: number;
    menuItemId: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  submittedAt: string;
  subtotalCents: number;
};

export interface OrderSubmissionService {
  submit(lines: readonly CartLine[], subtotal: number): LocalOrderReceipt;
}

/**
 * The sole order submitter for this prototype. It deliberately only creates a
 * local receipt snapshot; a future transport implementation can replace it.
 */
export class LocalOrderSubmissionService implements OrderSubmissionService {
  submit(lines: readonly CartLine[], subtotal: number): LocalOrderReceipt {
    return {
      lines: lines.map(({ id, lineTotalCents, name, quantity, unitPriceCents }) => ({
        lineTotalCents,
        menuItemId: id,
        name,
        quantity,
        unitPriceCents
      })),
      submittedAt: new Date().toISOString(),
      subtotalCents: subtotal
    };
  }
}

export const localOrderSubmissionService = new LocalOrderSubmissionService();
