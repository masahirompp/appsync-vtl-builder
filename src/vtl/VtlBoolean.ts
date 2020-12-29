import { staticImplements } from "../util/decorator";
import { VtlExpression, VtlExpressionStatic } from "./VtlExpression";

@staticImplements<VtlExpressionStatic<VtlBoolean>>()
export class VtlBoolean implements VtlExpression {
  protected constructor(private expression: string) {}

  static fromBoolean(value: boolean) {
    return new VtlBoolean(value ? "true" : "false");
  }
  static fromExpression(expression: string) {
    return new VtlBoolean(expression);
  }

  getExpression() {
    return this.expression;
  }

  copyInstance(newExpression?: string) {
    return new VtlBoolean(newExpression || this.getExpression());
  }

  not(vtlBoolean: VtlBoolean) {
    return new VtlBoolean(`!${vtlBoolean.getExpression()}`);
  }
}
