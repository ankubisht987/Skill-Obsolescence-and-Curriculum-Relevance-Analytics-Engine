/**
 * hooks/useApi.js
 * Generic hook for async API calls with loading + error state.
 */

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useApi(apiFn, { onSuccess, onError, successMsg } = {}) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      setData(res.data)
      if (successMsg) toast.success(successMsg)
      if (onSuccess)  onSuccess(res.data)
      return res.data
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Something went wrong'
      setError(msg)
      toast.error(msg)
      if (onError) onError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFn, successMsg, onSuccess, onError])

  return { data, loading, error, execute }
}

export function useFetch(apiFn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFn()
      setData(res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: fetch }
}
