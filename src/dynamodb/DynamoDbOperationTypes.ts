import { AttributeValue } from "aws-sdk/clients/dynamodb";

// https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html

interface DynamoDbOperation {
  version: string;
  operation: string;
}

type Expression = string; // Vtlの式。$util.dynamodb....など
type DynamoDbJson = { [key: string]: AttributeValue | Expression } | Expression;

export interface ExpressionStatement {
  expression: string;
  expressionNames?: { [key: string]: string };
  expressionValues?: DynamoDbJson;
}

export interface ConditionStatement extends ExpressionStatement {
  equalsIgnore?: string[];
  consistentRead?: boolean;
  conditionalCheckFailedHandler?:
    | { strategy: "Reject" }
    | { strategy: "Custom"; lambdaArn: string };
}

export interface GetItemMappingTemplate extends DynamoDbOperation {
  version: "2017-02-28" | "2018-05-29";
  operation: "GetItem";
  key: DynamoDbJson;
  consistentRead?: boolean;
}

export interface PutItemMappingTemplate extends DynamoDbOperation {
  version: "2017-02-28" | "2018-05-29";
  operation: "PutItem";
  key: DynamoDbJson;
  attributeValues?: DynamoDbJson;
  condition?: ConditionStatement;
  consistentRead?: boolean;
  _version?: number;
}

export interface UpdateItemMappingTemplate extends DynamoDbOperation {
  version: "2017-02-28" | "2018-05-29";
  operation: "UpdateItem";
  key: DynamoDbJson;
  update: ExpressionStatement;
  condition?: ConditionStatement;
  _version?: number;
}

export interface DeleteItemMappingTemplate extends DynamoDbOperation {
  version: "2017-02-28" | "2018-05-29";
  operation: "DeleteItem";
  key: DynamoDbJson;
  condition?: ConditionStatement;
  _version?: number;
}

export interface QueryMappingTemplate extends DynamoDbOperation {
  version: "2017-02-28" | "2018-05-29";
  operation: "Query";
  query: ExpressionStatement;
  filter?: ExpressionStatement;
  index?: string;
  nextToken?: string;
  limit?: number;
  scanIndexForward?: boolean;
  consistentRead?: boolean;
  select?: "ALL_ATTRIBUTES" | "ALL_PROJECTED_ATTRIBUTES";
}

export interface ScanMappingTemplate extends DynamoDbOperation {
  version: "2017-02-28" | "2018-05-29";
  operation: "Scan";
  filter?: ExpressionStatement;
  index?: string;
  nextToken?: string;
  limit?: number;
  scanIndexForward?: boolean;
  consistentRead?: boolean;
  select?: "ALL_ATTRIBUTES" | "ALL_PROJECTED_ATTRIBUTES";
  totalSegments?: number;
  segment?: number;
}

export interface SyncMappingTemplate extends DynamoDbOperation {
  version: "2018-05-29";
  operation: "Sync";
  filter?: ExpressionStatement;
  limit?: number;
  nextToken?: string;
  lastSync?: number;
}

export interface BatchGetItemMappingTemplate extends DynamoDbOperation {
  version: "2018-05-29";
  operation: "BatchGetItem";
  tables: {
    [tableName: string]: {
      keys: DynamoDbJson[];
      consistentRead?: boolean;
    };
  };
}

export interface BatchDeleteItemMappingTemplate extends DynamoDbOperation {
  version: "2018-05-29";
  operation: "BatchDeleteItem";
  tables: {
    [tableName: string]: DynamoDbJson[];
  };
}

export interface BatchPutItemMappingTemplate extends DynamoDbOperation {
  version: "2018-05-29";
  operation: "BatchPutItem";
  tables: {
    [tableName: string]: DynamoDbJson[];
  };
}

export interface TransactGetItemsMappingTemplate extends DynamoDbOperation {
  version: "2018-05-29";
  operation: "TransactGetItems";
  transactItems: {
    table: string;
    key: DynamoDbJson;
  }[];
}

export interface TransactWriteItemsMappingTemplate extends DynamoDbOperation {
  version: "2018-05-29";
  operation: "TransactWriteItems";
  transactItems: (
    | {
        table: string;
        operation: "PutItem";
        key: DynamoDbJson;
        attributeValues?: DynamoDbJson;
        condition?: ConditionStatement;
      }
    | {
        table: string;
        operation: "UpdateItem";
        key: DynamoDbJson;
        update: ExpressionStatement;
        condition?: ConditionStatement;
      }
    | {
        table: string;
        operation: "DeleteItem";
        key: DynamoDbJson;
        condition?: ConditionStatement;
      }
    | {
        table: string;
        operation: "ConditionCheck";
        key: DynamoDbJson;
        condition?: ConditionStatement;
      }
  )[];
}

const regex = /"(\$.+)"/;
export const toStringFromDynamoDbOperation = <T extends DynamoDbOperation>(
  templateJson: T
) => {
  let str = JSON.stringify(templateJson, null, 2);
  let match = regex.exec(str);
  while (match) {
    // $utilの式はダブルクオーテーションで囲まない。
    // また、
    // '$util.dynamodb.toDynamoDBJson("account")' は
    // $util.dynamodb.toDynamoDB(\"account\") に変換され、ダブルクオーテーションのエスケープが邪魔なので、
    // エスケープ文字も除外する
    str = str.replace(match[0], match[1].replace(/\\"/g, '"'));
    match = regex.exec(str);
  }
  return str;
};
