import { AppSyncVtlContext } from "./appsync/AppSyncVtlContext";
import { AppSyncVtlUtility } from "./appsync/AppSyncVtlUtility";
import {
  GetItemMappingTemplate,
  PutItemMappingTemplate,
  toStringFromDynamoDbOperation,
} from "./dynamodb/DynamoDbOperationTypes";
import {
  DynamoDbCondition,
  DynamoDbMap,
  toDynamoDbConditionJson,
  toDynamoDbJson,
} from "./dynamodb/DynamoDbVtlUtil";
import { MappingTemplateBuilder } from "./MappingTemplateBuilder";
import { VtlMapPath, VtlMapPaths } from "./util/types";
import { VtlArray } from "./vtl/VtlArray";
import { VtlBoolean } from "./vtl/VtlBoolean";
import { VtlExpression } from "./vtl/VtlExpression";
import { VtlMap } from "./vtl/VtlMap";
import { VtlNumber } from "./vtl/VtlNumber";

type CreateMappingTemplateOption = {
  indentSize: number;
  appsyncUtilName: "$util";
  contextName: "$context" | "$ctx";
};

const defaultOption: CreateMappingTemplateOption = {
  indentSize: 2,
  appsyncUtilName: "$util",
  contextName: "$context",
};

export const createMappingTemplate = <
  ContextArgs extends Record<string, VtlExpression> = Record<string, never>,
  Variables extends Record<string, VtlExpression> = Record<string, never>
>(
  template: (
    // eslint-disable-next-line @typescript-eslint/ban-types
    vtl: MappingTemplate<ContextArgs, {}>
  ) => MappingTemplate<ContextArgs, Variables>,
  option: Partial<CreateMappingTemplateOption> = {}
) => {
  const { appsyncUtilName, contextName, indentSize } = {
    ...defaultOption,
    ...option,
  };
  const builder = new MappingTemplateBuilder(indentSize);
  template(
    // eslint-disable-next-line @typescript-eslint/ban-types
    new MappingTemplate<ContextArgs, {}>(
      {},
      builder,
      new AppSyncVtlUtility(appsyncUtilName),
      new AppSyncVtlContext<ContextArgs>(contextName)
    )
  );
  return builder.build();
};

class MappingTemplate<
  ContextArguments extends Record<string, VtlExpression> = Record<
    string,
    never
  >,
  Variables extends Record<string, VtlExpression> = Record<string, never>
> {
  constructor(
    private readonly variables: Variables,
    private readonly builder: MappingTemplateBuilder,
    readonly $util: AppSyncVtlUtility,
    readonly $context: AppSyncVtlContext<ContextArguments>
  ) {}

  quiet(statement: (variables: Variables) => VtlExpression) {
    this.builder.addStatement(
      this.$util.quiet(statement(this.variables)).getExpression()
    );
    return this;
  }

  setVariable<N extends string, V extends VtlExpression>(
    name: N,
    valueOrFunction: (variables: Variables) => V
  ) {
    const target = valueOrFunction(this.variables) as V;

    this.builder.addStatement(`#set(${name} = ${target.getExpression()})`);

    return new MappingTemplate<ContextArguments, Variables & Record<N, V>>(
      { ...this.variables, [name]: target.copyInstance(name) as V },
      this.builder,
      this.$util,
      this.$context
    );
  }

  setNestedValue<
    T extends VtlMapPaths<Variables>,
    S extends VtlMapPath<Variables, T>
  >(paths: T, valueOrFunction: (variables: Variables) => S) {
    const target = valueOrFunction(this.variables) as VtlExpression;

    this.builder.addStatement(
      `#set(${paths.join(".")} = ${target.getExpression()})`
    );

    return this;
  }

  _if<V extends Variables>(
    vtlBoolean: VtlBoolean,
    ifBlock: (
      template: MappingTemplate<ContextArguments, Variables>
    ) => MappingTemplate<ContextArguments, V>
  ) {
    this.builder.addStatement(`#if(${vtlBoolean.getExpression()})`);
    const ifTemplate = this.builder.nested(() => ifBlock(this));

    const _else = <V2 extends V>(
      elseBlock: (
        template: MappingTemplate<ContextArguments, V>
      ) => MappingTemplate<ContextArguments, V2>
    ) => {
      this.builder.addStatement("#else");
      const elseTemplate = this.builder.nested(() => elseBlock(ifTemplate));
      return {
        _end: () => {
          this.builder.addStatement("#end");
          return elseTemplate;
        },
      };
    };
    const _elseif = <V3 extends V>(
      vtlBoolean: VtlBoolean,
      elseifBlock: (
        template: MappingTemplate<ContextArguments, V>
      ) => MappingTemplate<ContextArguments, V3>
    ) => {
      this.builder.addStatement(`#elseif(${vtlBoolean.getExpression()})`);
      const elseIfTemplate = this.builder.nested(() => elseifBlock(ifTemplate));
      return {
        _elseif,
        _else: <V4 extends V3>(
          elseBlock: (
            template: MappingTemplate<ContextArguments, V3>
          ) => MappingTemplate<ContextArguments, V4>
        ) => {
          this.builder.addStatement("#else");
          const elseTemplate = this.builder.nested(() =>
            elseBlock(elseIfTemplate)
          );
          return {
            _end: () => {
              this.builder.addStatement("#end");
              return elseTemplate;
            },
          };
        },
        _end: () => {
          this.builder.addStatement("#end");
          return elseIfTemplate;
        },
      };
    };

    return {
      _elseif,
      _else,
      _end: () => {
        this.builder.addStatement("#end");
        return ifTemplate;
      },
    };
  }

  foreach<I extends string, S extends VtlExpression, V extends Variables>(
    itemName: I,
    getItems: (variables: Variables) => VtlArray<S>,
    loopBlock: (
      template: MappingTemplate<ContextArguments, Variables>,
      $item: S,
      $foreach: { count: VtlNumber }
    ) => MappingTemplate<ContextArguments, V>
  ) {
    if (!itemName.startsWith("$")) {
      throw Error('itemName must start with "$"');
    }

    const items = getItems(this.variables);
    this.builder.addStatement(
      `#foreach(${itemName} in ${items.getExpression()})`
    );

    const loopTemplate = this.builder.nested(() =>
      loopBlock(this, items.itemInstance(itemName), {
        count: VtlNumber.fromExpression("$foreach.count"),
      })
    );
    this.builder.addStatement("#end");
    return loopTemplate;
  }

  break() {
    this.builder.addStatement("#break");
    return this;
  }

  return(obj?: VtlMap<Record<string, VtlExpression>>) {
    this.builder.addStatement(
      obj ? `#return(${obj.getExpression()})` : "#return"
    );
  }

  /**
   * DynamoDB
   */
  getItem(
    func: (
      variables: Variables
    ) => {
      key: DynamoDbMap;
    } & Partial<Pick<GetItemMappingTemplate, "version" | "consistentRead">>
  ) {
    const { key, consistentRead, version } = func(this.variables);
    this.builder.addStatement(
      toStringFromDynamoDbOperation<GetItemMappingTemplate>({
        version: version || "2018-05-29",
        operation: "GetItem",
        key: toDynamoDbJson(key),
        consistentRead,
      })
    );
    return this;
  }

  putItem(
    func: (
      variables: Variables
    ) => {
      key: DynamoDbMap;
      attributeValues?: DynamoDbMap;
      condition?: DynamoDbCondition;
    } & Partial<
      Pick<PutItemMappingTemplate, "version" | "consistentRead" | "_version">
    >
  ) {
    const {
      key,
      consistentRead,
      version,
      condition,
      attributeValues,
      _version,
    } = func(this.variables);
    this.builder.addStatement(
      toStringFromDynamoDbOperation<PutItemMappingTemplate>({
        version: version || "2018-05-29",
        operation: "PutItem",
        key: toDynamoDbJson(key),
        attributeValues: attributeValues && toDynamoDbJson(attributeValues),
        condition: condition && toDynamoDbConditionJson(condition),
        consistentRead,
        _version,
      })
    );
    return this;
  }
}
