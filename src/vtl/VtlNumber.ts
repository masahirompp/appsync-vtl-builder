import { staticImplements } from "../util/decorator";
import { VtlBoolean } from "./VtlBoolean";
import { VtlExpression, VtlExpressionStatic } from "./VtlExpression";
import { VtlString } from "./VtlString";

@staticImplements<VtlExpressionStatic<VtlNumber>>()
export class VtlNumber implements VtlExpression {
  protected constructor(private expression: string) {}

  static fromNumber(value: number) {
    return new VtlNumber(value + "");
  }

  static fromExpression(expression: string) {
    return new VtlNumber(expression);
  }

  getExpression() {
    return this.expression;
  }

  copyInstance(newExpression?: string) {
    return new VtlNumber(newExpression || this.getExpression());
  }

  equals(target: VtlNumber) {
    return VtlNumber.fromExpression(
      `${this.expression} == ${target.getExpression()}`
    );
  }

  toString() {
    return VtlString.fromExpression(`${this.getExpression()}.toString()`);
  }

  plus(target: VtlNumber) {
    return VtlNumber.fromExpression(
      `${this.expression} + ${target.getExpression()}`
    );
  }

  minus(target: VtlNumber) {
    return VtlNumber.fromExpression(
      `${this.expression} - ${target.getExpression()}`
    );
  }

  times(target: VtlNumber) {
    return VtlNumber.fromExpression(
      `${this.expression} * ${target.getExpression()}`
    );
  }

  dividedBy(target: VtlNumber) {
    return VtlNumber.fromExpression(
      `${this.expression} / ${target.getExpression()}`
    );
  }

  greaterThan(target: VtlNumber) {
    return VtlBoolean.fromExpression(
      `${this.expression} > ${target.getExpression()}`
    );
  }

  greaterThanOrEqualTo(target: VtlNumber) {
    return VtlBoolean.fromExpression(
      `${this.expression} >= ${target.getExpression()}`
    );
  }

  lessThan(target: VtlNumber) {
    return VtlBoolean.fromExpression(
      `${this.expression} < ${target.getExpression()}`
    );
  }

  lessThanOrEqualTo(target: VtlNumber) {
    return VtlBoolean.fromExpression(
      `${this.expression} <= ${target.getExpression()}`
    );
  }
}
