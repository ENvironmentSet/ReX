import { Cell, Stream } from 'sodiumjs';
import { BigNumber } from 'bignumber.js';

export type RunoNumber = BigNumber;

export type RunoText = string;

export type RunoBool = boolean;

const RunoTupleTag: unique symbol = Symbol('@RunoTupleTag');
export interface RunoTuple extends Record<string, RunoValue> {
  [RunoTupleTag]: typeof RunoTupleTag
}
export function createTuple(values: Record<string, RunoValue>): RunoTuple {
  const newTuple = {
    ...values
  };

  Object.defineProperty(newTuple, RunoTupleTag, { value: RunoTupleTag, enumerable: false });

  return newTuple as RunoTuple;
}
export function isRunoTuple(x: RunoValue): x is RunoTuple {
  return typeof x === 'object' && Reflect.has(x, RunoTupleTag);
}

export class RunoFunction {}

const RunoCustomValueTag: unique symbol = Symbol('@RunoCustomValueTag');
export type RunoCustomValue = { [RunoCustomValueTag]: typeof RunoCustomValueTag, tag: string, args: RunoValue[] };
export class RunoConstructor {}
export function isRunoCustomValue(x: RunoValue): x is RunoCustomValue {
  return typeof x === 'object' && Reflect.has(x, RunoCustomValueTag);
}

export type RunoEvent = Stream<RunoValue>;

export type RunoObservable = Cell<RunoValue>;

export type RunoValue = RunoNumber | RunoText | RunoBool | RunoTuple | RunoFunction | RunoConstructor | RunoEvent | RunoObservable | RunoCustomValue;

export function equals(x: RunoValue, y: RunoValue): boolean {
  if (x instanceof BigNumber && y instanceof BigNumber) return x.isEqualTo(y);
  if (typeof x === 'string' && typeof y === 'string') return x === y;
  if (typeof x === 'boolean' && typeof y === 'boolean') return x === y;
  if (isRunoTuple(x) && isRunoTuple(y))
    return Object.entries(x).every(([key, value]) => Reflect.has(y, key) && equals(value, y[key])) &&
      Object.entries(y).every(([key, value]) => Reflect.has(x, key) && equals(value, x[key]));
  if (isRunoCustomValue(x) && isRunoCustomValue(y)) return x.tag === y.tag && x.args.every((arg, i) => y.args[i] && equals(arg, y.args[i]));
  return false;
}