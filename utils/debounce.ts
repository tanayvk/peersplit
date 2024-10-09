const timeouts: Record<string, ReturnType<typeof setTimeout>> = {};
export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number,
  id: string,
) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    let result: any;
    timeouts[id] && clearTimeout(timeouts[id]);
    timeouts[id] = setTimeout(() => {
      result = callback(...args);
    }, waitFor);
    return result;
  };
};
