import { VtlBoolean } from "../vtl/VtlBoolean";
import { VtlExpression } from "../vtl/VtlExpression";
import { VtlMap } from "../vtl/VtlMap";
import { VtlString } from "../vtl/VtlString";
import { VtlVoid } from "../vtl/VtlVoid";
import { AppSyncVtlUtilityDynamoDB } from "./AppSyncVtlUtilityDynamoDB";

export class AppSyncVtlUtility {
  private readonly $util: string;
  dynamodb: AppSyncVtlUtilityDynamoDB;
  constructor($util = "$util") {
    this.$util = $util;
    this.dynamodb = new AppSyncVtlUtilityDynamoDB($util);
  }

  quiet(vtlExpression: VtlExpression) {
    return VtlVoid.fromExpression(
      `${this.$util}.quiet(${vtlExpression.getExpression()})`
    );
  }

  escapeJavaScript(vtlString: VtlString) {
    return VtlString.fromExpression(
      `${this.$util}.escapeJavaScript(${vtlString.getExpression()})`
    );
  }

  urlEncode(vtlString: VtlString) {
    return VtlString.fromExpression(
      `${this.$util}.urlEncode(${vtlString.getExpression()})`
    );
  }

  urlDecode(vtlString: VtlString) {
    return VtlString.fromExpression(
      `${this.$util}.urlDecode(${vtlString.getExpression()})`
    );
  }

  // TODO: base64Encode
  // TODO: base64Decode
  // TODO: parseJson

  toJson(obj: VtlExpression) {
    return VtlString.fromExpression(
      `${this.$util}.toJson(${obj.getExpression()})`
    );
  }

  autoId() {
    return VtlString.fromExpression(`${this.$util}.autoId()`);
  }

  unauthorized() {
    return VtlVoid.fromExpression(`${this.$util}.unauthorized()`);
  }

  error(
    message: VtlString,
    errorType?: VtlString,
    data?: VtlMap<Record<string, VtlExpression>>,
    errorInfo?: VtlMap<Record<string, VtlExpression>>
  ) {
    return VtlVoid.fromExpression(
      `${this.$util}.error(${[message, errorType, data, errorInfo]
        .filter((s) => !!s)
        .map((s) => s?.getExpression())
        .join(", ")})`
    );
  }

  appendError(
    message: VtlString,
    errorType?: VtlString,
    data?: VtlMap<Record<string, VtlExpression>>,
    errorInfo?: VtlMap<Record<string, VtlExpression>>
  ) {
    return VtlVoid.fromExpression(
      `${this.$util}.appendError(${[message, errorType, data, errorInfo]
        .filter((s) => !!s)
        .map((s) => s?.getExpression())
        .join(", ")})`
    );
  }

  validate(
    valid: VtlBoolean,
    message: VtlString,
    errorType?: VtlString,
    data?: VtlMap<Record<string, VtlExpression>>
  ) {
    return VtlVoid.fromExpression(
      `${this.$util}.validate(${[valid, message, errorType, data]
        .filter((s) => !!s)
        .map((s) => s?.getExpression())
        .join(", ")})`
    );
  }

  isNull(target: VtlExpression) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isNull(${target.getExpression()})`
    );
  }

  isNullOrEmpty(target: VtlString) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isNullOrEmpty(${target.getExpression()})`
    );
  }

  isNullOrBlank(target: VtlString) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isNullOrBlank(${target.getExpression()})`
    );
  }

  // TODO: defaultIfNull

  defaultIfNullOrEmpty(target: VtlString, defaultValue: VtlString) {
    return VtlString.fromExpression(
      `${this.$util}.defaultIfNullOrEmpty(${
        (target.getExpression(), defaultValue.getExpression())
      })`
    );
  }

  defaultIfNullOrBlank(target: VtlString, defaultValue: VtlString) {
    return VtlString.fromExpression(
      `${this.$util}.defaultIfNullOrBlank(${
        (target.getExpression(), defaultValue.getExpression())
      })`
    );
  }

  isString(target: VtlExpression) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isString(${target.getExpression()})`
    );
  }

  isNumber(target: VtlExpression) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isNumber(${target.getExpression()})`
    );
  }

  isBoolean(target: VtlExpression) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isBoolean(${target.getExpression()})`
    );
  }

  isList(target: VtlExpression) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isList(${target.getExpression()})`
    );
  }

  isMap(target: VtlExpression) {
    return VtlBoolean.fromExpression(
      `${this.$util}.isMap(${target.getExpression()})`
    );
  }

  typeOf(target: VtlExpression) {
    return VtlString.fromExpression(
      `${this.$util}.typeOf(${target.getExpression()})`
    );
  }

  matches(regex: VtlString, target: VtlString) {
    return VtlBoolean.fromExpression(
      `${this.$util}.matches(${
        (regex.getExpression(), target.getExpression())
      })`
    );
  }

  // TODO: $time
  // TODO: $list
  // TODO: $map
}
