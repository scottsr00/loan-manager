import useSWR from "swr"
import { Borrower } from "@/components/borrowers/columns"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useBorrowers() {
  return useSWR<Borrower[]>("/api/borrowers", fetcher)
} 