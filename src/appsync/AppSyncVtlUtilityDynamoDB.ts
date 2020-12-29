import { VtlMap } from "../";
import { AttributeValueMap } from "../dynamodb/DynamoDbVtlUtil";
import { VtlExpression } from "../vtl/VtlExpression";

export class AppSyncVtlUtilityDynamoDB {
  private readonly $dynamodb: string;
  constructor($util = "$util") {
    this.$dynamodb = $util + ".dynamodb";
  }

  toDynamoDB(obj: VtlExpression) {
    return VtlMap.fromExpression<AttributeValueMap>(
      `${this.$dynamodb}.toDynamoDB(${obj.getExpression()})`
    );
  }

  toDynamoDBJson(obj: VtlExpression) {
    return VtlMap.fromExpression<AttributeValueMap>(
      `${this.$dynamodb}.toDynamoDBJson(${obj.getExpression()})`
    );
  }

  // TODO: 以下をすべて実装する
  // https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/resolver-util-reference.html#dynamodb-helpers-in-util-dynamodb
}
