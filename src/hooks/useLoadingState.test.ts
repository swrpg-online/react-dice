import { renderHook, act } from '@testing-library/react';
import { useLoadingState } from './useLoadingState';
import { LoadingState } from '../types';

describe('useLoadingState', () => {
  it('initializes with Loading state by default', () => {
    const { result } = renderHook(() => useLoadingState());
    
    expect(result.current.state).toBe(LoadingState.Loading);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('initializes with provided initial state', () => {
    const { result } = renderHook(() => useLoadingState(LoadingState.Success));
    
    expect(result.current.state).toBe(LoadingState.Success);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('transitions to loading state', () => {
    const { result } = renderHook(() => useLoadingState(LoadingState.Success));
    
    act(() => {
      result.current.setLoading();
    });
    
    expect(result.current.state).toBe(LoadingState.Loading);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('transitions to success state', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setSuccess();
    });
    
    expect(result.current.state).toBe(LoadingState.Success);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('transitions to error state', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setError();
    });
    
    expect(result.current.state).toBe(LoadingState.Error);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it('allows direct state setting', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setState(LoadingState.Error);
    });
    
    expect(result.current.state).toBe(LoadingState.Error);
    expect(result.current.isError).toBe(true);
    
    act(() => {
      result.current.setState(LoadingState.Success);
    });
    
    expect(result.current.state).toBe(LoadingState.Success);
    expect(result.current.isSuccess).toBe(true);
  });

  it('maintains stable function references', () => {
    const { result, rerender } = renderHook(() => useLoadingState());
    
    const { setLoading, setSuccess, setError, setState } = result.current;
    
    // Re-render the hook
    rerender();
    
    // Functions should maintain the same reference
    expect(result.current.setLoading).toBe(setLoading);
    expect(result.current.setSuccess).toBe(setSuccess);
    expect(result.current.setError).toBe(setError);
    expect(result.current.setState).toBe(setState);
  });

  it('handles multiple state transitions correctly', () => {
    const { result } = renderHook(() => useLoadingState());
    
    // Start with loading
    expect(result.current.isLoading).toBe(true);
    
    // Transition to success
    act(() => {
      result.current.setSuccess();
    });
    expect(result.current.isSuccess).toBe(true);
    
    // Transition to error
    act(() => {
      result.current.setError();
    });
    expect(result.current.isError).toBe(true);
    
    // Back to loading
    act(() => {
      result.current.setLoading();
    });
    expect(result.current.isLoading).toBe(true);
  });
});