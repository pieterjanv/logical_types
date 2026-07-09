import type { In, Comparable } from "./types/logic.ts";

export const comparable: <T>() => <U>(x: In<U, T>) => Comparable<T> = () => (x: any) => x;
