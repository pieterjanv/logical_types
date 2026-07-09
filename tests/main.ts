import type { And, In, Not, Or } from "../src/types/logic.ts";

declare const example_1_2__T_implies_U: <T>(
	x: In<T, Or<[Not<{ a: true }>, { b: true }]>>,
) => T;
example_1_2__T_implies_U({ a: true, b: true } as const);
// @ts-expect-error
example_1_2__T_implies_U({ a: true, b: false } as const);
example_1_2__T_implies_U({ a: false, b: true } as const);
example_1_2__T_implies_U({ a: false, b: false } as const);

declare const example_1_2__T_negimplies_U: <T>(
	x: In<T, Not<Or<[Not<{ a: true }>, { b: true }]>>>,
) => T;
// @ts-expect-error
example_1_2__T_negimplies_U({ a: true, b: true } as const);
example_1_2__T_negimplies_U({ a: true, b: false } as const);
// @ts-expect-error
example_1_2__T_negimplies_U({ a: false, b: true } as const);
// @ts-expect-error
example_1_2__T_negimplies_U({ a: false, b: false } as const);

declare const example_1_2__T_doublenegimplies_U: <T>(
	x: In<T, Not<Not<Or<[Not<{ a: true }>, { b: true }]>>>>,
) => T;
example_1_2__T_doublenegimplies_U({ a: true, b: true } as const);
// @ts-expect-error
example_1_2__T_doublenegimplies_U({ a: true, b: false } as const);
example_1_2__T_doublenegimplies_U({ a: false, b: true } as const);
example_1_2__T_doublenegimplies_U({ a: false, b: false } as const);

declare const example_1_2__complicated: <T>(
	x: In<T, Not<Or<[
		Not<{ a: true }>,
		And<[{ b: true }, (
			Or<[{ c: true }, Not<Or<[
				Not<{ b: true }>,
				{ a: true }
			]>>]>
		)]>
	]>>>,
) => T;
// @ts-expect-error
example_1_2__complicated({ a: true, b: true, c: true } as const);
example_1_2__complicated({ a: true, b: true, c: false } as const);
example_1_2__complicated({ a: true, b: false, c: true } as const);
example_1_2__complicated({ a: true, b: false, c: false } as const);
// @ts-expect-error
example_1_2__complicated({ a: false, b: true, c: true } as const);
// @ts-expect-error
example_1_2__complicated({ a: false, b: true, c: false } as const);
// @ts-expect-error
example_1_2__complicated({ a: false, b: false, c: true } as const);
// @ts-expect-error
example_1_2__complicated({ a: false, b: false, c: false } as const);

declare const example_2_1__non_string_non_numbers: <T>(
	x: In<T, And<[Not<string>, Not<number>]>>,
) => T;
example_2_1__non_string_non_numbers(true);
example_2_1__non_string_non_numbers({ a: true } as const);
// @ts-expect-error
example_2_1__non_string_non_numbers("string" as const);
// @ts-expect-error
example_2_1__non_string_non_numbers(5 as const);

declare const example_2_2__partial_target: <T>(
	x: In<T, And<[{ a: boolean }, { a?: true }]>>,
) => T;
example_2_2__partial_target({ a: true } as const);
// @ts-expect-error
example_2_2__partial_target({ a: false } as const);
// @ts-expect-error
example_2_2__partial_target({ a: undefined } as const);
// @ts-expect-error
example_2_2__partial_target({ b: true } as const);

// Anything goes, because we are testing against a tautology.
declare const example_2_3_1__non_number_implies_non_5: <T>(
	x: In<T, Or<[{ a: number }, Not<{ a: 5 }>]>>
) => T;
example_2_3_1__non_number_implies_non_5({ a: "string" } as const);
example_2_3_1__non_number_implies_non_5({ a: true } as const);
example_2_3_1__non_number_implies_non_5({ a: false } as const);
example_2_3_1__non_number_implies_non_5({ a: null } as const);
example_2_3_1__non_number_implies_non_5({ a: undefined } as const);
example_2_3_1__non_number_implies_non_5({ a: 5 } as const);
example_2_3_1__non_number_implies_non_5({ a: 6 } as const);
example_2_3_1__non_number_implies_non_5({} as const);

// At key `a` anything goes except numbers, except 5.
declare const example_2_3_2__non_5_implies_non_number: <T>(
	x: In<T, Or<[{ a: 5 }, Not<{ a: number }>]>>
) => T;
example_2_3_2__non_5_implies_non_number({ a: "string" } as const);
example_2_3_2__non_5_implies_non_number({ a: true } as const);
example_2_3_2__non_5_implies_non_number({ a: false } as const);
example_2_3_2__non_5_implies_non_number({ a: null } as const);
example_2_3_2__non_5_implies_non_number({ a: undefined } as const);
example_2_3_2__non_5_implies_non_number({ a: 5 } as const);
// @ts-expect-error
example_2_3_2__non_5_implies_non_number({ a: 6 } as const);
example_2_3_2__non_5_implies_non_number({} as const);

declare const example_2_4__partially_overlapping_objects: <T>(
	x: In<T, { b: true, c: true }>,
) => T;
// @ts-expect-error
example_2_4__partially_overlapping_objects({ a: true, b: true } as const);

declare const example_2_5__partially_overlapping_objects_w_negation: <T>(
	x: In<T, Not<{ b: true, c: true }>>,
) => T;
example_2_5__partially_overlapping_objects_w_negation({ a: true, b: true } as const);
// @ts-expect-error - without overlap
example_2_5__partially_overlapping_objects_w_negation({ b: true, c: true } as const);

declare const example_2_6__partially_overlapping_objects_w_negation_alternate: <T>(
	x: In<T, Or<[{ b: Not<true> }, { c: Not<true> }]>>,
) => T;
// @ts-expect-error
example_2_6__partially_overlapping_objects_w_negation_alternate({ a: true, b: true } as const);

declare const example_2_7__logical_types_on_keys: <T>(
	x: In<T, And<[
		{ a: Not<true> },
		{ b: true },
		{ c: Or<[Not<true>, { d: true }]> }
	]>>,
) => T;
example_2_7__logical_types_on_keys({ a: false, b: true, c: false } as const);
example_2_7__logical_types_on_keys({ a: false, b: true, c: { d: true } } as const);
example_2_7__logical_types_on_keys({ a: false, b: true, c: { d: false } } as const);
// @ts-expect-error
example_2_7__logical_types_on_keys({ a: false, b: false, c: false } as const);
// @ts-expect-error
example_2_7__logical_types_on_keys({ a: true, b: true, c: false } as const);
// @ts-expect-error
example_2_7__logical_types_on_keys({ a: true, b: true, c: { d: true } } as const);
