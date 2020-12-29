/* eslint-disable @typescript-eslint/ban-types */

import { A, I, L, O, U } from "ts-toolbelt";
import { VtlMap } from "../vtl/VtlMap";

export type Statement = string | Statement[];

export type ExtractVtlMap<T extends {}> = {
  [P in keyof T]: T[P] extends VtlMap<infer R> ? ExtractVtlMap<R> : T[P];
};

export type VtlMapPaths<T extends {}> = O.Paths<ExtractVtlMap<T>>;

type __VtlMapPath<
  T,
  Path extends L.List<A.Key>,
  I extends I.Iteration = I.IterationOf<"0">
> = {
  0: __VtlMapPath<
    O.At<
      U.NonNullable<T extends VtlMap<infer R> ? R : T> & {},
      Path[I.Pos<I>],
      1
    >,
    Path,
    I.Next<I>
  >;
  1: T;
}[A.Extends<I.Pos<I>, L.Length<Path>>];

type _VtlMapPath<T extends {}, Path extends L.List> = __VtlMapPath<
  T,
  Path
> extends infer X
  ? A.Cast<X, any>
  : never;

export type VtlMapPath<T extends {}, Path extends L.List> = Path extends unknown
  ? _VtlMapPath<T, Path>
  : never;
