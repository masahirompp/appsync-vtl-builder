import { staticImplements } from "../util/decorator";
import { VtlBoolean } from "./VtlBoolean";
import { VtlExpression, VtlExpressionStatic } from "./VtlExpression";
import { VtlNumber } from "./VtlNumber";

@staticImplements<VtlExpressionStatic<VtlString>>()
export class VtlString implements VtlExpression {
  protected constructor(private expression: string) {}

  static fromString(str: string) {
    return new VtlString(JSON.stringify(str));
  }
  static fromExpression(str: string) {
    return new VtlString(str);
  }

  getExpression() {
    return this.expression;
  }

  copyInstance(newExpression?: string) {
    return new VtlString(newExpression || this.getExpression());
  }

  toUpperCase() {
    return new VtlString(`${this.getExpression()}.toUpperCase()`);
  }

  equals(target: VtlString) {
    return VtlBoolean.fromExpression(
      `${this.getExpression()} == ${target.expression}`
    );
  }

  indexOf(str: VtlString) {
    return VtlNumber.fromExpression(
      `${this.getExpression()}.indexOf(${str.getExpression()})`
    );
  }

  substring(beginIndex: VtlNumber) {
    return VtlString.fromExpression(
      `${this.getExpression()}.substring(${beginIndex.getExpression()})`
    );
  }

  concat(str: VtlString) {
    return VtlString.fromExpression(
      `${this.getExpression()}.concat(${str.getExpression()})`
    );
  }
}
