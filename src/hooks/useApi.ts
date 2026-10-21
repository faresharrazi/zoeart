import { useCallback, useEffect, useRef, useState } from "react";

interface ApiState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Runs `load` when the component mounts and whenever `deps` change, and
 * tracks its result. Results from an outdated call are ignored.
 */
export function useApi<T>(load: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<ApiState<T>>({
    data: undefined,
    loading: true,
    error: null,
  });
  const loadRef = useRef(load);
  loadRef.current = load;
  const callId = useRef(0);

  const run = useCallback(async () => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await loadRef.current();
      if (id === callId.current)
        setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === callId.current) {
        setState({
          data: undefined,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch: run };
}
