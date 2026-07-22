export const PRICE_BANDS = [
  { value: "under-500", label: "Under ₹500", test: (price: number) => price < 500 },
  { value: "500-1500", label: "₹500 – ₹1,500", test: (price: number) => price >= 500 && price <= 1500 },
  { value: "1500-5000", label: "₹1,500 – ₹5,000", test: (price: number) => price > 1500 && price <= 5000 },
  { value: "above-5000", label: "Above ₹5,000", test: (price: number) => price > 5000 },
];

export const RATING_BANDS = [
  { value: "4-plus", label: "4★ & above", test: (rating: number) => rating >= 4 },
  { value: "3-plus", label: "3★ & above", test: (rating: number) => rating >= 3 },
];

// Filters arrive from the URL as "under-500,500-1500" — split back into an array
export function parseSelected(param?: string): string[] {
  if (!param) return [];
  return param.split(",").filter(Boolean);
}

// OR within a filter group (price band A or B), AND across groups (price AND rating)
export function matchesFilters(
  product: { price: number; rating: number },
  selectedPrices: string[],
  selectedRatings: string[]
) {
  const priceOk =
    selectedPrices.length === 0 ||
    selectedPrices.some((v) => PRICE_BANDS.find((b) => b.value === v)?.test(product.price));

  const ratingOk =
    selectedRatings.length === 0 ||
    selectedRatings.some((v) => RATING_BANDS.find((b) => b.value === v)?.test(product.rating));

  return priceOk && ratingOk;
}