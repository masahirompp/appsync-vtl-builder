import { staticImplements } from "../util/decorator";
import { VtlExpression, VtlExpressionStatic } from "./VtlExpression";

@staticImplements<VtlExpressionStatic<VtlVoid>>()
export class VtlVoid implements VtlExpression {
  protected constructor(private expression: string) {}

  static fromString(str: string) {
    return new VtlVoid(JSON.stringify(str));
  }
  static fromExpression(str: string) {
    return new VtlVoid(str);
  }

  getExpression() {
    return this.expression;
  }

  copyInstance(newExpression?: string) {
    return new VtlVoid(newExpression || this.getExpression());
  }
}
