import useSWR from 'swr'
import type { SWRConfiguration } from 'swr'

const defaultFetcher = (url: string) => fetch(url).then((res) => res.json())

interface UseDataOptions<T> extends SWRConfiguration {
  initialData?: T
  fetcher?: (url: string) => Promise<T>
}

export function useData<T>(
  url: string | null,
  options: UseDataOptions<T> = {}
) {
  const {
    initialData,
    fetcher = defaultFetcher,
    ...swrOptions
  } = options

  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<T>(url, fetcher, {
    fallbackData: initialData,
    ...swrOptions
  })

  return {
    data,
    error,
    isLoading,
    mutate,
    isError: !!error
  }
} 