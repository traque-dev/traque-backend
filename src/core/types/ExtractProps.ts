type AnyFunc = (...args: any[]) => any;
type IsProp<T, K extends keyof T> = T[K] extends AnyFunc ? never : K;
export type ExtractProps<T> = {
  [k in keyof T as IsProp<T, k>]: T[k];
};
