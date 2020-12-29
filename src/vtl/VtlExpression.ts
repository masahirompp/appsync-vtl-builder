export interface VtlExpression {
  getExpression(): string;
  copyInstance(newExpression?: string): VtlExpression;
}

export interface VtlExpressionStatic<T extends VtlExpression> {
  // new (expression: string): VtlExpression;
  fromExpression(expression: string): T;
}
