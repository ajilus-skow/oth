const usdFormatter = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" });

export function formatUsd(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) return "Price unavailable";
  return usdFormatter.format(cents / 100);
}
