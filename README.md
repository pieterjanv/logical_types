# Logical types

An exploration to see whether logical statements can take types as arguments.
E.g., can I negate a type, and interpret one type implying another type?

My hunch is yes.

The approach taken is to define a type system that can express logical type
combinations including merely negation, conjunction, and disjunction, and to
provide a type that checks that given such a type, some other type meets the
constraints. Since assignability is almost like logical implication, it's fairly
easy to deal with intersections and unions including negation due to some
simplifying transformations that are like some tautologies of propositional
logic.

The main logical results that underpin this approach follow below. Note
that these are all tautologies of propositional logic, but not all tautologies
of propositional logic apply to types in TypeScript. To translate a logical
proposition below, read conjunction `∧` as intersection, disjunction `∨` as
union, and negation `¬` as complement. Implication `→` is the assignability
relation. Note also that straightforward examples for each tautology can be
obtained by mapping logical true to `unknown` and logical false to `never`.


## Example usage

TODO: Add examples for assigning to a `Comparable` and typechecking a parameter.


## Underpinning logical results


### Dealing with negated targets and assignability


#### if `¬(source ∧ target)` then `source → ¬target`

If there is zero overlap between source and target, then source is assignable
to the negation of target. Zero overlap is easy to check between non-negated
types by checking assignability of their intersection to `never`.


#### `source → source ∧ target` is equivalent to `source → target`

If source is assignable to the intersection of source and target,
then source is assignable to target.

This allows us to receive an intersection, yet check for assignability.


#### If `(source → target) ∧ (source → ¬target)` then `¬source`

If source is assignable to target, then if source is also assignable to
the negation of target, source must be never.


#### In case of partial overlap between source and target, there is no assignability to target or its negation

There is no propositional tautology that is analogous to this case, but if there is
mere partial overlap, there is a member of source in target and a member of source
not in target, so there is no assignability in either case.


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

If a common key's type on an intersection of sources is not present on any individual source,
then there is a false negative.

Similarly, if a common key's type on a union of targets is not present on any individual target,
then there is a false negative.

One solution is to map keys to types many-to-one, so a different type implies a different key.

As it stands I don't see why that is a disadvantage, given an easy way to match a key to a type.
