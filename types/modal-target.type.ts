export interface UseModalTargetResult<T> {
  /** True while a target is set. */
  isOpen: boolean;
  /** The item the modal acts on, or null when closed. */
  target: T | null;
  open: (target: T) => void;
  close: () => void;
}
