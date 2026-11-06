import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "../../lib/api";
import type { FoodItem, NewFoodItem } from "../../lib/types";

export const FOOD_ITEMS_KEY = ["foodItems"];

export function useFoodItems() {
  return useQuery({
    queryKey: FOOD_ITEMS_KEY,
    queryFn: async () => (await apiCall<{ foodItems: FoodItem[] }>("/fooditem")).foodItems ?? [],
  });
}

export function useCreateFoodItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: NewFoodItem) =>
      (await apiCall<{ foodItem: FoodItem }>("/fooditem", "POST", item)).foodItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOOD_ITEMS_KEY }),
  });
}
