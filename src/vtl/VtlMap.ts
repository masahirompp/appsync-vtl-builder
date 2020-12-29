import { staticImplements } from "../util/decorator";
import { VtlExpression, VtlExpressionStatic } from "./VtlExpression";
import { VtlString } from "./VtlString";
import { VtlStringArray } from "./VtlStringArray";

export type VtlMapObject = Record<string, VtlExpression>;

@staticImplements<VtlExpressionStatic<VtlMap<never>>>()
export class VtlMap<T extends VtlMapObject> implements VtlExpression {
  protected constructor(private expression: string) {}

  static fromObject<T extends VtlMapObject>(values: Partial<T>) {
    return new VtlMap<T>(this.build(values));
  }
  static fromExpression<T extends VtlMapObject>(expression: string) {
    return new VtlMap<T>(expression);
  }

  private static build<T extends VtlMapObject>(values: Partial<T>) {
    if (Object.keys(values).length === 0) {
      return "{}";
    }
    const keyValueList = Object.entries(values).map(
      ([key, value]) =>
        "  " + JSON.stringify(key) + ": " + value.getExpression()
    );
    return `{
${keyValueList.join(",\n")}
}`;
  }

  getExpression() {
    return this.expression;
  }

  copyInstance(newExpression?: string) {
    return new VtlMap<T>(newExpression || this.getExpression());
  }

  get<K extends keyof T>(name: K | VtlExpression) {
    // TODO: 優先度高。String以外の型に対応する
    return VtlString.fromExpression(
      `${this.getExpression()}.get(${
        typeof name === "object" ? name.getExpression() : JSON.stringify(name)
      })`
    );
  }

  put(name: keyof T | VtlExpression, value: VtlExpression) {
    return VtlString.fromExpression(
      `${this.expression}.put(${
        typeof name === "object" ? name.getExpression() : JSON.stringify(name)
      }, ${value.getExpression()})`
    ); // TODO: VtlStringだけじゃない
  }

  keySet() {
    return VtlStringArray.fromExpression(`${this.expression}.keySet()`);
  }
}

const a = new Map();
