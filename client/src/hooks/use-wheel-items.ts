import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { WheelItem, InsertWheelItem } from "@shared/schema";

export function useWheelItems() {
  return useQuery<WheelItem[]>({
    queryKey: ["/api/wheel-items"],
  });
}

export function useAddWheelItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: InsertWheelItem) => {
      const res = await apiRequest("POST", "/api/wheel-items", item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheel-items"] });
    },
  });
}

export function useDeleteWheelItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wheel-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheel-items"] });
    },
  });
}

export function useClearWheelItems() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/wheel-items");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheel-items"] });
    },
  });
}

export function useRecordSpin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (result: string) => {
      const res = await apiRequest("POST", "/api/spins", {
        result,
        spunAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spin-stats"] });
    },
  });
}

export function useSpinStats() {
  return useQuery<{ totalSpins: number; lastWinner: string | null }>({
    queryKey: ["/api/spin-stats"],
  });
}
