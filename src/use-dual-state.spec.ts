import { renderHook, act } from '@testing-library/react-hooks';
import { useState } from 'react';
import { useDualState } from './use-dual-state';

const run = (initialState, persistor = undefined) => renderHook(() => {
  const [mutation, setMutation] = useState(null);

  const dualState = useDualState(initialState, mutation, persistor);

  return {
     setMutation,
     dualState,
  }
});

describe('useDualState', () => {
  test('init/plain-object', () => {
    const INITIAL_STATE = {
      page: 1,
      keyword: '',
    };
    const { result } = run(INITIAL_STATE);

    expect(result.current.dualState[0]).toBe(INITIAL_STATE);
    expect(result.current.dualState[1]).toBe(INITIAL_STATE);
  })

  test('init/function', () => {

  })

  test('init/persistor', () => {

  })

  test('mutation/set', () => {



    const { result } = renderHook(() => {

    });

    expect('')
  });

  test('mutation/sync', () => {

  });

  test('mutation/both', () => {

  });
});
