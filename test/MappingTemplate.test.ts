import {
  createMappingTemplate,
  VtlMap,
  VtlNumber,
  VtlNumberArray,
  VtlString,
  VtlStringArray,
} from "../src/index";

test("test1", () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl
        .setVariable("$id", () => vtl.$util.autoId())
        ._if(
          VtlStringArray.fromExpression("$context.items").isEmpty(),
          (template) => template.setVariable("$test1", () => vtl.$util.autoId())
        )
        ._end()
    )
  ).toBe(`#set($id = $util.autoId())
#if($context.items.isEmpty())
  #set($test1 = $util.autoId())
#end
`);
});

test("test2", () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl.setVariable("$var", () => VtlString.fromString("a string"))
    )
  ).toBe(`#set($var = "a string")
`);
});

test(`test3`, () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl.setVariable("$myMap", () =>
        VtlMap.fromObject({
          id: vtl.$context.arguments.get("id"),
          meta: VtlString.fromString("stuff"),
          upperMeta: vtl.$context.arguments.get("meta").toUpperCase(),
        })
      )
    )
  ).toBe(`#set($myMap = {
  "id": $context.arguments.get("id"),
  "meta": "stuff",
  "upperMeta": $context.arguments.get("meta").toUpperCase()
})
`);
});

test(`test4`, () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl
        .setVariable("$myMap", () => VtlMap.fromObject<{ id: VtlString }>({}))
        .quiet(({ $myMap }) =>
          $myMap.put("id", VtlString.fromString("first value"))
        )
    )
  ).toBe(`#set($myMap = {})
$util.quiet($myMap.put("id", "first value"))
`);
});

test(`test5`, () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl
        .setVariable("$myMap", () =>
          VtlMap.fromObject<{
            myProperty: VtlString;
            arrProperty: VtlStringArray;
            jsonProperty: VtlMap<{ AppSync: VtlString; Cognito: VtlString }>;
          }>({})
        )
        .setNestedValue(["$myMap", "myProperty"], () =>
          VtlString.fromString("ABC")
        )
        .setNestedValue(["$myMap", "arrProperty"], () =>
          VtlStringArray.fromArray([
            VtlString.fromString("Write"),
            VtlString.fromString("Some"),
            VtlString.fromString("GraphQL"),
          ])
        )
        .setNestedValue(["$myMap", "jsonProperty"], () =>
          VtlMap.fromObject({
            AppSync: VtlString.fromString("Offline and Realtime"),
            Cognito: VtlString.fromString("AuthN and AuthZ"),
          })
        )
    )
  ).toBe(`#set($myMap = {})
#set($myMap.myProperty = "ABC")
#set($myMap.arrProperty = ["Write", "Some", "GraphQL"])
#set($myMap.jsonProperty = {
  "AppSync": "Offline and Realtime",
  "Cognito": "AuthN and AuthZ"
})
`);
});

test(`test6`, () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl
        .setVariable("$myList", () => VtlStringArray.fromArray([]))
        .quiet(({ $myList }) => $myList.add(VtlString.fromString("something")))
    )
  ).toBe(`#set($myList = [])
$util.quiet($myList.add("something"))
`);
});

test("test7", () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl
        .setVariable("$bigString", () =>
          VtlString.fromString(
            "This is a long string, I want to pull out everything after the comma"
          )
        )
        .setVariable("$comma", ({ $bigString }) =>
          $bigString.indexOf(VtlString.fromString(","))
        )
        .setVariable("$comma", ({ $comma }) =>
          $comma.plus(VtlNumber.fromNumber(2))
        )
        .setVariable("$substring", ({ $bigString, $comma }) =>
          $bigString.substring($comma)
        )
    )
  )
    .toBe(`#set($bigString = "This is a long string, I want to pull out everything after the comma")
#set($comma = $bigString.indexOf(","))
#set($comma = $comma + 2)
#set($substring = $bigString.substring($comma))
`);
});

test("test8", () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl
        .setVariable("$myMap", () =>
          VtlMap.fromObject<{ [key: string]: VtlString }>({})
        )
        .setVariable("$start", () => VtlNumber.fromNumber(0))
        .setVariable("$end", () => VtlNumber.fromNumber(5))
        .setVariable("$range", ({ $start, $end }) =>
          VtlNumberArray.fromRange($start, $end)
        )
        .foreach(
          "$i",
          ({ $range }) => $range,
          (template, $i) =>
            template.quiet(({ $myMap }) =>
              $myMap.put($i, $i.toString().concat(VtlString.fromString("foo")))
            )
        )
    )
  ).toBe(`#set($myMap = {})
#set($start = 0)
#set($end = 5)
#set($range = [$start..$end])
#foreach($i in $range)
  $util.quiet($myMap.put($i, $i.toString().concat("foo")))
#end
`);
});

test("test9", () => {
  expect(
    createMappingTemplate((vtl) =>
      vtl
        .setVariable("$myMap", () =>
          VtlMap.fromObject<{ [key: string]: VtlString }>({})
        )
        .setVariable("$hashmap", () =>
          VtlMap.fromObject<{ [key: string]: VtlString }>({
            DynamoDB: VtlString.fromString("https://aws.amazon.com/dynamodb/"),
            Amplify: VtlString.fromString("https://github.com/aws/aws-amplify"),
            DynamoDB2: VtlString.fromString("https://aws.amazon.com/dynamodb/"),
            Amplify2: VtlString.fromString(
              "https://github.com/aws/aws-amplify"
            ),
          })
        )
        .foreach(
          "$key",
          ({ $hashmap }) => $hashmap.keySet(),
          (template, $key, $foreach) =>
            template
              ._if(
                $foreach.count.greaterThan(VtlNumber.fromNumber(2)),
                (template) => template.break()
              )
              ._end()
              .quiet(({ $myMap, $hashmap }) =>
                $myMap.put($key, $hashmap.get($key))
              )
        )
    )
  ).toBe(`#set($myMap = {})
#set($hashmap = {
  "DynamoDB": "https://aws.amazon.com/dynamodb/",
  "Amplify": "https://github.com/aws/aws-amplify",
  "DynamoDB2": "https://aws.amazon.com/dynamodb/",
  "Amplify2": "https://github.com/aws/aws-amplify"
})
#foreach($key in $hashmap.keySet())
  #if($foreach.count > 2)
    #break
  #end
  $util.quiet($myMap.put($key, $hashmap.get($key)))
#end
`);
});

test("getItem", () => {
  expect(
    createMappingTemplate<{ foo: VtlString; bar: VtlString }>((vtl) =>
      vtl.getItem(() => ({
        key: {
          foo: vtl.$util.dynamodb.toDynamoDBJson(
            vtl.$context.arguments.get("foo")
          ),
          bar: vtl.$util.dynamodb.toDynamoDBJson(
            vtl.$context.arguments.get("bar")
          ),
        },
      }))
    )
  ).toBe(`{
  "version": "2018-05-29",
  "operation": "GetItem",
  "key": {
    "foo": $util.dynamodb.toDynamoDBJson($context.arguments.get("foo")),
    "bar": $util.dynamodb.toDynamoDBJson($context.arguments.get("bar"))
  }
}
`);
});

test("putItem", () => {
  expect(
    createMappingTemplate<{ foo: VtlString; bar: VtlString; baz: VtlNumber }>(
      (vtl) =>
        vtl.putItem(() => ({
          key: {
            foo: vtl.$util.dynamodb.toDynamoDBJson(
              vtl.$context.arguments.get("foo")
            ),
            bar: vtl.$util.dynamodb.toDynamoDBJson(
              vtl.$context.arguments.get("bar")
            ),
          },
          attributeValues: {
            baz: vtl.$util.dynamodb.toDynamoDBJson(
              vtl.$context.arguments.get("baz")
            ),
          },
          condition: {
            expression: "attribute_not_exists(bar)",
          },
        }))
    )
  ).toBe(`{
  "version": "2018-05-29",
  "operation": "PutItem",
  "key": {
    "foo": $util.dynamodb.toDynamoDBJson($context.arguments.get("foo")),
    "bar": $util.dynamodb.toDynamoDBJson($context.arguments.get("bar"))
  },
  "attributeValues": {
    "baz": $util.dynamodb.toDynamoDBJson($context.arguments.get("baz"))
  },
  "condition": {
    "expression": "attribute_not_exists(bar)"
  }
}
`);
});
