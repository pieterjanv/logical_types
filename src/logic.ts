import type { In, Comparable } from "./types/logic.ts";
export * from "./types/logic.ts";

/**
 * Cast a value to a comparable logical type.
 * @example const ok = assign<And<[Not<number>, Not<boolean>]>>()("test");
 * @example const notOk = assign<And<[Not<number>, Not<string>]>>()("test"); // "Argument of type 'string' is not assignable to parameter of type 'Not<number> & Not<string>'."
 */
export const assign: <T>() => <U>(x: In<U, T>) => Comparable<T> = () => (x: any) => x;
