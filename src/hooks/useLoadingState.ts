/**
 * @fileoverview Custom hook for managing loading states in components
 */

import { useState, useCallback } from 'react';
import { LoadingState } from '../types';

/**
 * Custom hook for managing loading states with type-safe transitions
 * 
 * @param initialState - Initial loading state (defaults to Loading)
 * @returns Object containing current state and state setters
 * 
 * @example
 * const { state, setLoading, setSuccess, setError, setState } = useLoadingState();
 * 
 * // Start loading
 * setLoading();
 * 
 * // On success
 * setSuccess();
 * 
 * // On error
 * setError();
 */
export const useLoadingState = (initialState: LoadingState = LoadingState.Loading) => {
  const [state, setState] = useState<LoadingState>(initialState);

  const setLoading = useCallback(() => setState(LoadingState.Loading), []);
  const setSuccess = useCallback(() => setState(LoadingState.Success), []);
  const setError = useCallback(() => setState(LoadingState.Error), []);

  const isLoading = state === LoadingState.Loading;
  const isSuccess = state === LoadingState.Success;
  const isError = state === LoadingState.Error;

  return {
    state,
    setState,
    setLoading,
    setSuccess,
    setError,
    isLoading,
    isSuccess,
    isError,
  };
};