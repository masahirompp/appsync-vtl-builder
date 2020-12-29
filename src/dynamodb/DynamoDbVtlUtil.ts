import { VtlBoolean } from "../vtl/VtlBoolean";
import { VtlExpression } from "../vtl/VtlExpression";
import { VtlMap } from "../vtl/VtlMap";
import { VtlNumber } from "../vtl/VtlNumber";
import { VtlNumberArray } from "../vtl/VtlNumberArray";
import { VtlString } from "../vtl/VtlString";
import { VtlStringArray } from "../vtl/VtlStringArray";

export type AttributeValueMap = {
  S: VtlString;
  SS: VtlStringArray;
  N: VtlNumber;
  NS: VtlNumberArray;
  // B: TODO: binary
  // BS: TODO: binary
  BOOL: VtlBoolean;
  // L: TODO: List
  M: VtlMap<Record<string, VtlExpression>>;
  // NULL: TODO: Null
};

export type DynamoDbMap =
  | VtlMap<Record<string, VtlMap<AttributeValueMap>>>
  | Record<string, VtlMap<AttributeValueMap>>;

export type DynamoDbNamesMap =
  | VtlMap<Record<string, VtlMap<Pick<AttributeValueMap, "S">>>>
  | Record<string, VtlMap<Pick<AttributeValueMap, "S">>>;

export const toDynamoDbJson = (obj: DynamoDbMap) =>
  obj instanceof VtlMap
    ? obj.getExpression()
    : Object.fromEntries(
        Object.entries(obj).map(([name, value]) => [
          name,
          value.getExpression(),
        ])
      );

export type DynamoDbCondition = {
  expression: string;
  expressionNames?: DynamoDbNamesMap;
  expressionValues?: DynamoDbMap;
  equalsIgnore?: string[];
  consistentRead?: boolean;
  conditionalCheckFailedHandler?:
    | { strategy: "Reject" }
    | { strategy: "Custom"; lambdaArn: string };
};

export const toDynamoDbConditionJson = ({
  expressionNames,
  expressionValues,
  ...params
}: DynamoDbCondition) => ({
  ...params,
  expressionNames:
    expressionNames &&
    Object.fromEntries(
      Object.entries(expressionNames).map(([name, value]) => [
        name,
        value.getExpression(),
      ])
    ),
  expressionValues:
    expressionValues &&
    Object.fromEntries(
      Object.entries(expressionValues).map(([name, value]) => [
        name,
        value.getExpression(),
      ])
    ),
});
