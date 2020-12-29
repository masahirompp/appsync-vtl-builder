import { VtlBoolean } from "./VtlBoolean";
import { VtlExpressionStatic, VtlExpression } from "./VtlExpression";
import { VtlNumber } from "./VtlNumber";

export abstract class VtlArray<T extends VtlExpression> {
  protected constructor(private expression: string) {}

  protected abstract ItemClass: VtlExpressionStatic<T>;

  getExpression() {
    return this.expression;
  }

  itemInstance(expression: string) {
    return this.ItemClass.fromExpression(expression);
  }

  isEmpty() {
    return VtlBoolean.fromExpression(`${this.getExpression()}.isEmpty()`);
  }

  add(value: T) {
    return VtlBoolean.fromExpression(
      `${this.getExpression()}.add(${value.getExpression()})`
    );
  }

  get(index: VtlNumber): T {
    return this.ItemClass.fromExpression(
      `${this.getExpression()}.get(${index.getExpression()})`
    );
  }

  set(index: VtlNumber, value: T): T {
    return this.ItemClass.fromExpression(
      `${this.getExpression()}.set(${index.getExpression()}, ${
        value.getExpression
      })`
    );
  }
}
