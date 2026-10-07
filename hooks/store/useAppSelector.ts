import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

/** Typed `selector` for components in this app. */
export const useAppSelector = useSelector.withTypes<RootState>();
