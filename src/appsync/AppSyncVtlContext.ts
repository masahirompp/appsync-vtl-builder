import { VtlExpression } from "../vtl/VtlExpression";
import { VtlMap } from "../vtl/VtlMap";
import { VtlString } from "../vtl/VtlString";
import { VtlStringArray } from "../vtl/VtlStringArray";

// https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/resolver-context-reference.html

export class AppSyncVtlContext<
  Arguments extends Record<string, VtlExpression> = Record<string, never>,
  Result extends Record<string, VtlExpression> = Record<string, never>
> {
  protected readonly $context: string;
  constructor($context = "$context") {
    this.$context = $context;
  }

  get arguments() {
    return VtlMap.fromExpression<Arguments>(`${this.$context}.arguments`); // TODO: 優先度高い。VtlString以外の型にも対応させる
  }

  get source() {
    return VtlMap.fromObject({}); // TODO
  }

  get result() {
    return VtlMap.fromExpression<Result>(`${this.$context}.result`);
  }

  // TODO: 利用する認証方式によって型を可変にする
  get identity() {
    return VtlMap.fromExpression<
      {
        // IAM
        accountId: VtlString;
        cognitoIdentityPoolId: VtlString;
        cognitoIdentityId: VtlString;
        sourceIp: VtlStringArray;
        username: VtlString; // IAM user principal
        userArn: VtlString;
        cognitoIdentityAuthType: VtlString; // authenticated/unauthenticated based on the identity type
        cognitoIdentityAuthProvider: VtlString; // the auth provider that was used to obtain the credentials
      } & {
        // COGNITO, OPEN_ID_CONNECT
        sub: VtlString;
        issuer: VtlString;
        username: VtlString;
        claims: VtlMap<Record<string, VtlExpression>>; // TODO: 型を調べる
        sourceIp: VtlStringArray;
        defaultAuthStrategy: VtlString;
      }
    >(`${this.$context}.identity`);
  }

  get request() {
    // TODO
    return VtlMap.fromExpression<{
      headers: VtlMap<Record<string, VtlExpression>>;
    }>(`${this.$context}.request`);
  }

  get info() {
    return VtlMap.fromExpression<{
      fieldName: VtlString;
      parentTypeName: VtlString;
      variables: VtlMap<Record<string, VtlExpression>>;
      selectionSetList: VtlStringArray;
      selectionSetGraphQL: VtlString;
    }>(`${this.$context}.request`);
  }
}
