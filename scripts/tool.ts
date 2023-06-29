import fs from "fs";
import path from "path";
import crlf from "crlf";

export async function readModels() {
  const schemas: Record<string, string> = {};

  const __rootModelsDirname = `${process.cwd()}/models`;
  const rootModels = fs.readdirSync(__rootModelsDirname);

  await Promise.all(
    rootModels.map(async (fileName) => {
      if (fileName === "fs" || fileName === "toolkits") {
        return;
      }

      const endingType = await new Promise((resolve) => {
        crlf.get(
          `${__rootModelsDirname}/${fileName}`,
          null,
          function (err, endingType) {
            resolve(endingType);
          }
        );
      });

      if (endingType === "CRLF") {
        await new Promise((resolve) => {
          crlf.set(`${__rootModelsDirname}/${fileName}`, "LF", function () {
            resolve("");
          });
        });
      }

      const filePath = path.resolve(__rootModelsDirname, fileName);
      if (fs.statSync(filePath).isFile()) {
        schemas[fileName] = fs
          .readFileSync(filePath, { encoding: "utf8" })
          //@ts-ignore
          .replaceAll("\n", "");
      }
    })
  );

  const __toolkitsModelsDirname = `${process.cwd()}/models/toolkits`;
  const toolkitsModels = fs.readdirSync(__toolkitsModelsDirname);

  await Promise.all(
    toolkitsModels.map(async (fileName) => {
      const endingType = await new Promise((resolve) => {
        crlf.get(
          `${__toolkitsModelsDirname}/${fileName}`,
          null,
          function (err, endingType) {
            resolve(endingType);
          }
        );
      });

      if (endingType === "CRLF") {
        await new Promise((resolve) => {
          crlf.set(`${__toolkitsModelsDirname}/${fileName}`, "LF", function () {
            resolve("");
          });
        });
      }

      const filePath = path.resolve(__toolkitsModelsDirname, fileName);
      if (fs.statSync(filePath).isFile()) {
        schemas[fileName] = fs
          .readFileSync(filePath, { encoding: "utf8" })
          //@ts-ignore
          .replaceAll("\n", "");
      }
    })
  );

  return schemas;
}

export function writeToOutput(val: object | string) {
  const filePath = path.resolve(`${process.cwd()}/output`, "app.json");
  fs.writeFileSync(filePath, JSON.stringify(val, null, 2));
}

enum YamlType {
  array = "array",
  string = "string",
  multilines = "multilines",
  boolean = "boolean",
  number = "number",
  null = "null",
  object = "object",
  emptyObject = "emptyObject",
}

export class JSToYamlResult {
  value?: string;
  error?: Error;
}

export default class JSToYaml {
  private static spacing = "  ";
  private static spacingStart = "";

  public static stringify(data: any): JSToYamlResult {
    const result = { value: "" } as JSToYamlResult;
    const type = this.getType(data);
    switch (type) {
      case YamlType.boolean:
      case YamlType.multilines:
      case YamlType.null:
      case YamlType.number:
      case YamlType.string:
        result.error = new Error("Must be an object or an array");
        return result;
    }

    if (type === YamlType.array) {
      this.convertFromArray(data, result, 0);
    } else {
      this.convertFromObject(data, result, 0);
    }

    return result;
  }

  private static convertFromArray(
    data: any[],
    result: JSToYamlResult,
    deep: number
  ) {
    data.forEach((value) => {
      result.value += `${this.spacingStart}${this.spacing.repeat(deep)}- `;
      const type: YamlType = this.getType(value);
      switch (type) {
        case YamlType.null:
        case YamlType.number:
        case YamlType.boolean:
          result.value += `${value}\n`;
          break;
        case YamlType.string:
          result.value += `${this.normalizeString(value)}\n`;
          break;
        case YamlType.multilines:
          result.value += `|-\n`;
          value.split("\n").forEach((line: string) => {
            result.value += `${this.spacingStart}${this.spacing.repeat(
              deep + 1
            )}${line}\n`;
          });
          break;
        case YamlType.array:
          if (value.length) {
            result.value += "\n";
            this.convertFromArray(value, result, deep + 1);
          } else {
            result.value += "[]\n";
          }
          break;
        case YamlType.emptyObject:
          result.value += `{}\n`;
          break;
        default:
          result.value += "\n";
          this.convertFromObject(value, result, deep + 1);
          break;
      }
    });
  }

  private static convertFromObject(
    data: any,
    result: JSToYamlResult,
    deep: number
  ) {
    for (const propertyName of Object.keys(data)) {
      if (data.hasOwnProperty(propertyName)) {
        const value = data[propertyName] as any;
        const type: YamlType = this.getType(value);
        result.value += `${this.spacingStart}${this.spacing.repeat(
          deep
        )}${this.normalizeKey(propertyName)}: `;
        switch (type) {
          case YamlType.null:
          case YamlType.number:
          case YamlType.boolean:
            result.value += `${value}\n`;
            break;
          case YamlType.string:
            result.value += `${this.normalizeString(value)}\n`;
            break;
          case YamlType.multilines:
            result.value += `|-\n`;
            value.split("\n").forEach((line: string) => {
              result.value += `${this.spacingStart}${this.spacing.repeat(
                deep + 1
              )}${line}\n`;
            });
            break;
          case YamlType.array:
            if (value.length) {
              result.value += "\n";
              this.convertFromArray(value, result, deep);
            } else {
              result.value += "[]\n";
            }
            break;
          case YamlType.emptyObject:
            result.value += `{}\n`;
            break;
          default:
            result.value += "\n";
            this.convertFromObject(value, result, deep + 1);
            break;
        }
      }
    }
  }

  private static normalizeKey(str: string): string {
    if (str.indexOf(" ") > -1) {
      return this.normalizeString(str);
    }
    return str;
  }

  private static normalizeString(str: string): string {
    return `"${str.split('"').join('\\"')}"`;
  }

  private static getType(data: any): YamlType {
    const type: string = typeof data;
    if (data === null) {
      return YamlType.null;
    }
    if (data instanceof Array) {
      return YamlType.array;
    }
    switch (type) {
      case "string":
        if (data.indexOf("\n") > -1) {
          return YamlType.multilines;
        }
        return YamlType.string;
      case "boolean":
        return YamlType.boolean;
      case "number":
        return YamlType.number;
      case "undefined":
        return YamlType.null;
      default:
        if (Object.keys(data).length === 0) {
          return YamlType.emptyObject;
        }
        return YamlType.object;
    }
  }
}
