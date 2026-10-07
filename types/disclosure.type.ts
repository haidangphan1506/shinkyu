export interface UseDisclosureResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
