# Logical types

An exploration to see whether types can be combined logically, i.e. with complements, intersections and unions. Practicailty has been an aim, but it's too early to say whether this is useful in practice.

The results can be tested at [https://pieterjanv.github.io/logical_types/](https://pieterjanv.github.io/logical_types/). Scroll to the bottom for examples of usage.


## Introduction

My hunch is that all validities between types involving complement, intersection,
and union are validities of propositional logic with a straightforward mapping
of `never` to `false` and the rest to `true`. If true, then one can easily
disprove a suspected validity between types with a truth table
generator for propositional logic; if it's not true for all truth assignments,
then it's not a validity between types.

The aim is then to find a way to transform logical type combinations into a form
that TypeScript can check for assignability, using only validities of both
propositional logic and plausibly of types.

The approach taken is to define a simple type system that can express logical type
combinations including merely negation, conjunction, and disjunction, and to
provide a way to check that given such a type, some other type meets its
constraints. My assumption is that assignability of `source` to `target` implies
`source → target` when we map `never` to `false` and the rest to `true`, but
it seems the resemblance is deeper. Then it's fairly easy to make some educated
guesses as to how to deal with intersections and unions including negation, as
some tautologies of propositional logic around implication suggest a way to
decompose them in a way that native TypeScript types correctly handle.

The main logical results that underpin this approach follow below. Note
that these are all tautologies of propositional logic, but not all tautologies
of propositional logic apply to types in TypeScript. To translate a logical
proposition below, read conjunction `∧` as intersection, disjunction `∨` as
union, and negation `¬` as complement. Implication `→` maps to the assignability
relation. Note also that straightforward examples for each tautology can be
obtained by mapping logical true to a single non-`never` type and logical false
to `never`.

It's easy to verify these are tautologies, i.e. true for all possible inputs,
with the [truth table generator](https://web.stanford.edu/class/cs103/tools/truth-table-tool/) published at Stanford.


## Example usage


### Using the casting function.

```typescript
// @ts-expect-error "Argument of type 'string' is not assignable to parameter of type 'Not<string> & Not<number>'."
const stringIsUnassignable = assign<Not<Or<[string, number]>>>()("test");

const booleanIsFine = assign<Not<Or<[string, number]>>>()(true);
booleanIsFine;
```


### Type a function that has logical types as parameters and return type.

```typescript
function takesNonNumberReturnsNonString<T>(
	x: In<T, And<[Not<number>, string]>>,
): Comparable<Not<string>> {
	return assign<Not<string>>()(x.length);
}

// @ts-expect-error "Argument of type 'number' is not assignable to parameter of type 'Not<number> & string'."
const numberIsUnassignable = takesNonNumberReturnsNonString(5);

const stringIsFine = takesNonNumberReturnsNonString("hello");
stringIsFine;
```


## Underpinning logical results


### Testing assignability via intersections


#### `source → source ∧ target` is equivalent to `source → target`

If source is assignable to the intersection of source and target,
then source is assignable to target.

This allows us to receive an intersection, yet check for assignability.


#### In case of partial overlap between source and target, there is no assignability to target or its negation

If the previous test fails and the intersection is not `never`, then there is
mere partial overlap.

There is no propositional tautology that is analogous to this case, but if there is
mere partial overlap, there is a member of source in target and a member of source
not in target, so there is no assignability in either case.


### Dealing with negated targets and assignability


#### If `¬(source ∧ target)` then `source → ¬target`

If there is zero overlap between source and target, then source is assignable
to the negation of target. Zero overlap is easy to check between non-negated
types by checking assignability of their intersection to `never`.


#### If `(source ∧ target) ∧ (source → target)` then `¬(source → ¬target)`

If there is partial overlap between source and target, and source is assignable
to target, then source is not never and assignable so it's not in target's
complement.


### Dealing with negated source and target


#### `target → source` is equivalent to `¬source → ¬target`

If and only if target is assignable to source, then the
source's negation is assignable to the negated target. The negation of source
and target is therefore solved with the simpler contrapositive form.


### Dealing with a negated source


#### If `¬source → target` then `¬target → source`

We transform the problem of a negated source into a problem of a negated non-negated
target, because we can then keep unwrapping the source by alternating between this
and the previous transformation, until a simple case is reached.


### Dealing with intersected sources


#### If `(sourceA → target) ∨ (sourceB → target)` then `(sourceA ∧ sourceB) → target`

If the disjunction of the simple assignability cases holds, then the conjunction of the
sources is assignable to the target.

The converse is false, even though true in classical logic. A counterexample is

`sourceA = { a: string, b: 5 }`, `sourceB = { a: "test", b: number }`, and
`target = { a: "test", b: 5 }`. Neither is assignable individually, but
the intersection is.

Right now the error is on the side of caution, as some valid cases are refused.

It seems like a corner case, because when does one depend on requiring an intersection between
individually unassignable sources to get an assignable source? One need only add
a conservatively wide source to get the converse.


### Dealing with unioned sources


#### `(sourceA → target) ∧ (sourceB → target)` is equivalent to `(sourceA ∨ sourceB) → target`

If and only if both sources are assignable individually, their union is assignable.

The forward direction is least obvious, because the union of the sources is at least as wide as
either source. Yet, because every member of the union is a member of one or the other source,
target is wide enough to accept the union as well.

The converse must be true, because the union is at least as wide as either source, yet is
assignable. So the individual sources are, too.


### Dealing with intersected targets


#### `(source → targetA) ∧ (source → targetB)` is equivalent to `source → targetA ∧ targetB`

If and only if the source is assignable to both targets, it is assignable to their intersection.

Again, the forward direction is least obvious, because the intersection of the targets is at most
as wide as either target. Yet, because source is assignable to every intersection member, there
is no intersection that is too narrow to accept the source.

The converse must be true, because the intersection is at most as wide as either target, yet is
assignable. So the individual targets are, too.


### Dealing with unioned targets


#### If `(source → targetA) ∨ (source → targetB)` then `source → targetA ∨ targetB`

`targetA` and `targetB` are individually at most as wide as `targetA ∨ targetB`. So
if the source is separately assignable to them, it is assignable to their union as well.

The converse is not given. A counterexample is `source = { a: 5 | 6 }`, `targetA = { a: 5 }`,
and `targetB = { a: 6 }`. The source is assignable to the union, but not to either target
individually.

I'm unclear at the moment if this more of an edge or corner case.


### Dealing with the error on the side of caution on deciding subtype relationships

If a common key's type on an intersection of sources is not present on that key of
any individual source, then there is a false negative.

Similarly, if a common key's type on a union of targets is not present on that key of
any individual target, then there is a false negative.

One solution is to map keys to types many-to-one, so a different type implies a
different key.

As it stands I don't see why that is a disadvantage, given an easy way to match a key
to a type.
