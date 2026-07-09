import type { Comparable, In } from "./types.js";

export const comparable: <T>() => <U>(x: In<U, T>) => Comparable<T> = () => (x: any) => x;
