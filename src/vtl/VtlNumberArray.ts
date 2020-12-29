import { staticImplements } from "../util/decorator";
import { VtlArray } from "./VtlArray";
import { VtlExpressionStatic } from "./VtlExpression";
import { VtlNumber } from "./VtlNumber";

@staticImplements<VtlExpressionStatic<VtlNumberArray>>()
export class VtlNumberArray extends VtlArray<VtlNumber> {
  protected ItemClass = VtlNumber;

  static fromExpression(expression: string) {
    return new VtlNumberArray(expression);
  }

  static fromArray(arr: VtlNumber[]) {
    return new VtlNumberArray(
      "[" + arr.map((item) => item.getExpression()).join(", ") + "]"
    );
  }

  static fromRange(start: VtlNumber, end: VtlNumber) {
    return new VtlNumberArray(
      `[${start.getExpression()}..${end.getExpression()}]`
    );
  }

  copyInstance(newExpression?: string) {
    return new VtlNumberArray(newExpression || this.getExpression());
  }
}
