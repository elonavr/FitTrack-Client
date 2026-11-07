import { useMutation } from "@tanstack/react-query";
import { apiCall } from "../../lib/api";
import type { ScannedProduct } from "../../lib/types";

// A mutation (not a query) so each scan is an explicit event the page can chain the auto-add onto.
export function useLookupProduct() {
  return useMutation({
    mutationFn: async (barcode: string) =>
      (await apiCall<{ product: ScannedProduct }>(`/products/${barcode}`)).product,
  });
}
