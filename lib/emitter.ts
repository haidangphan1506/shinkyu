/** Minimal typed pub/sub. `subscribe` returns an unsubscribe function. */
export function createEmitter<T>() {
  const listeners = new Set<(value: T) => void>();

  return {
    subscribe(listener: (value: T) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(value: T) {
      listeners.forEach((listener) => listener(value));
    },
  };
}
