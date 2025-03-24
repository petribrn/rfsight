import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';

// Export hooks to interact with React Redux Slices/Reducers
export const useAppDispatch: () => AppDispatch = useDispatch; // dispatch action to reducer
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; // select from reducer state
