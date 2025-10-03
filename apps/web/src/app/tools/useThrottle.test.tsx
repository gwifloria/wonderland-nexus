import { act, renderHook } from "@testing-library/react";
import { useThrottle } from "./useThrottle";

jest.useFakeTimers();

describe("useThrottle", () => {
  it("should call the function immediately on first invoke", () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useThrottle(fn, 1000));

    act(() => {
      result.current("first");
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");
  });

  it("should not call again if called within delay", () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useThrottle(fn, 1000));

    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should allow call after delay passes", () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useThrottle(fn, 1000));

    act(() => {
      result.current("a");
    });

    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
      result.current("b");
    });
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(600);
      result.current("c");
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("c");
  });
});
