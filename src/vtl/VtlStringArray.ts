import { staticImplements } from "../util/decorator";
import { VtlArray } from "./VtlArray";
import { VtlExpressionStatic } from "./VtlExpression";
import { VtlString } from "./VtlString";

@staticImplements<VtlExpressionStatic<VtlStringArray>>()
export class VtlStringArray extends VtlArray<VtlString> {
  protected ItemClass = VtlString;

  static fromExpression(expression: string) {
    return new VtlStringArray(expression);
  }

  static fromArray(arr: VtlString[]) {
    return new VtlStringArray(
      "[" + arr.map((item) => item.getExpression()).join(", ") + "]"
    );
  }

  copyInstance(newExpression?: string) {
    return new VtlStringArray(newExpression || this.getExpression());
  }
}
