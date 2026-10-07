import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';

/** Typed `dispatch` for components in this app. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
