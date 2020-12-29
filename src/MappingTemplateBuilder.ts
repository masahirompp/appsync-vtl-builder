type StatementIndication = {
  indicationType: "statement";
  statement: string;
};

type IndentUpIndication = {
  indicationType: "indentUp";
};

type IndentDownIndication = {
  indicationType: "indentDown";
};

type Indication =
  | StatementIndication
  | IndentUpIndication
  | IndentDownIndication;

export class MappingTemplateBuilder {
  private indications: Indication[] = [];

  constructor(public readonly indentSize = 2) {}

  addStatement(statement: string) {
    this.indications.push({ indicationType: "statement", statement });
    return this;
  }

  nested<T>(nestedBlock: () => T) {
    this.indications.push({ indicationType: "indentUp" });
    const result = nestedBlock();
    this.indications.push({ indicationType: "indentDown" });
    return result;
  }

  build(): string {
    return this.indications.reduce<{
      currentIndent: number;
      statement: string;
    }>(
      ({ currentIndent, statement }, indication) => {
        switch (indication.indicationType) {
          case "statement":
            return {
              currentIndent,
              statement:
                statement +
                " ".repeat(currentIndent) +
                indication.statement +
                "\n",
            };
          case "indentUp":
            return {
              currentIndent: currentIndent + this.indentSize,
              statement,
            };
          case "indentDown":
            return {
              currentIndent: currentIndent - this.indentSize,
              statement,
            };
          default:
            throw Error("Unexpected Error");
        }
      },
      { currentIndent: 0, statement: "" }
    ).statement;
  }
}
