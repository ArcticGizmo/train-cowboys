// used to remove the ending of a type
type RemoveEnding<S extends string, E extends string> = S extends `${infer T}${E}` ? T : S;

// Keep any that has the ending
type KeepWithEnding<S extends string, E extends string> = S extends `${infer T}${E}` ? S : never;

// Both of the above together
export type RemoveAndKeepWithEnding<S extends string, E extends string> = RemoveEnding<KeepWithEnding<S, E>, E>