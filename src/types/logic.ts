declare const andS: unique symbol;
declare const orS: unique symbol;
declare const notS: unique symbol;
declare const arrayS: unique symbol;
export type LogicalType =
	| { [andS]: readonly unknown[] }
	| { [orS]: readonly unknown[] }
	| { [notS]: unknown }
	| { [arrayS]: LogicalType };

export type And<T extends readonly unknown[]> = { [andS]: T };
export type Or<T extends readonly unknown[]> = { [orS]: T };
export type Not<T> = { [notS]: T };

export type Comparable<T> = (
	Not<any> extends T ? T extends Not<any> ? ComparableNegation<T> : T
	: And<any> extends T ? T extends And<readonly unknown[]> ? ComparableAnd<T> : T
	: Or<any> extends T ? T extends Or<readonly unknown[]> ? ComparableOr<T> : T
	: any[] extends T ? T extends Array<infer U> ? Comparable<U>[] : T
	: T
);

type ComparableNegation<T extends Not<any>> = (
	T extends Not<And<any>> ? ComparableNotAnd<T>
	: T extends Not<Or<any>> ? ComparableNotOr<T>
	: T extends Not<Not<infer U>> ? Comparable<U>
	: T
);

type ComparableAnd<T extends And<readonly unknown[]>> = (
	T extends And<[infer Head, ...infer Tail extends readonly unknown[]]> ? (
		& Comparable<Head>
		& ComparableAnd<And<Tail>>
	) : unknown
);

type ComparableNotAnd<T extends Not<And<readonly unknown[]>>> = (
	T extends Not<And<infer U extends readonly unknown[]>> ? (
		Comparable<Or<MapNegation<U>>>
	) : never
);

type ComparableOr<T extends Or<readonly unknown[]>> = (
	T extends Or<[infer Head, ...infer Tail extends readonly unknown[]]> ? (
		| Comparable<Head>
		| ComparableOr<Or<Tail>>
	) : never
);

type ComparableNotOr<T extends Not<Or<readonly unknown[]>>> = (
	T extends Not<Or<infer U extends readonly unknown[]>> ? (
		Comparable<And<MapNegation<U>>>
	) : never
);

type MapNegation<T extends readonly unknown[], Result extends readonly unknown[] = []> = (
	T extends [infer Head, ...infer Tail extends readonly unknown[]] ? (
		MapNegation<Tail, [...Result, Head extends Not<infer U> ? U : Not<Head>]>
	) : Result
);

// Assignability
export type In<Source, Target> = (
	Source extends never ? never
	: Source extends In2<Source, Target> ? Comparable<Source> : Comparable<Target>
);
export type In2<Source, Target> = (
	Source extends never ? never
	: Source extends And<[
		infer SourceHead,
		...infer SourceTail extends readonly unknown[]
	]> ? (
		| In2<SourceHead, Target>
		| (SourceTail extends infer SourceTail2 extends [
			unknown,
			...readonly unknown[]
		] ? In2<And<SourceTail2>, Target> : never)
	)
	: Source extends Or<[
		infer SourceHead,
		...infer SourceTail extends readonly unknown[]
	]> ? (
		& In2<SourceHead, Target>
		& (SourceTail extends infer SourceTail2 extends [
			unknown,
			...readonly unknown[]
		] ? In2<Or<SourceTail2>, Target> : unknown)
	)
	: Target extends And<[
		infer TargetHead,
		...infer TargetTail extends readonly unknown[]
	]> ? (
		& In2<Source, TargetHead>
		& (TargetTail extends infer TargetTail2 extends [
			unknown,
			...readonly unknown[]
		] ? In2<Source, And<TargetTail2>> : unknown)
	)
	: Target extends Or<[
		infer TargetHead,
		...infer TargetTail extends readonly unknown[]
	]> ? (
		| In2<Source, TargetHead>
		| (TargetTail extends infer TargetTail2 extends [
			unknown,
			...readonly unknown[]
		] ? In2<Source, Or<TargetTail2>> : never)
	)
	: Not<any> extends Source ? (
		Source extends Not<infer NegatedSource> ? (
			Not<any> extends Target ? (
				Target extends Not<infer NegatedTarget> ? (
					NegatedTarget extends In2<NegatedTarget, NegatedSource> ? Source
					: never
				)
				: NegatedSource extends LogicalType ? In2<Not<Target>, NegatedSource>
				: unknown extends Target ? Source
				: FullyReducedIn<Source, Target>
			)
			: FullyReducedIn<Source, Target>
		)
		: In3<Source, Target>
	)
	: In3<Source, Target>
);

type In3<Source, Target> = (
	Not<any> extends Target ? (
		Target extends Not<infer NegatedTarget> ? (
			In2<Source, NegatedTarget> extends never ? Source
			: Source extends In2<Source, NegatedTarget> ? never
			: never
		)
		: FullyReducedIn<Source, Target>
	)
	: Source extends any[] ? (
		Target extends any[] ? (
			number extends Source['length'] ? (
				Source extends Array<infer SourceElement> ? (
					Target extends Array<infer TargetElement> ? (
						SourceElement extends In2<SourceElement, TargetElement> ? Source
						: never
					)
					: never
				)
				: never
			)
			: Source extends [infer SourceHead, ...infer SourceTail extends readonly unknown[]] ? (
				Target extends [infer TargetHead, ...infer TargetTail extends readonly unknown[]] ? (
					Target['length'] extends Source['length'] ? (
						[In2<SourceHead, TargetHead>, ...In2<SourceTail, TargetTail>]
					)
					: never
				)
				: never
			)
			: Source extends [] ? (
				Target extends [] ? Source : never
			)
			: never
		)
		: never
	)
	: Target extends any[] ? never
	: Source extends object ? (
		Target extends object ? (
			Source extends (
				& { [Key in keyof Target]: (
					Key extends keyof Source ? (
						Source[Key] extends In2<Source[Key], Target[Key]> ? Source[Key]
						: never
					)
					: never
				) }
				& { [Key in Exclude<keyof Source, keyof Target>]: Source[Key] }
			) ? Source
			: never
		)
		: never
	)
	: FullyReducedIn<Source, Target>
);

type FullyReducedIn<Source, Target> = (
	Target extends string | number | boolean | bigint | symbol | null | undefined | void ? (
		Source extends Target ? Source : never
	)
	: Source & Target
);
