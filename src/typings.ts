export type Initiator<S> = S | (() => S);

export type Mutator<S> = S | ((prev: S) => S);
