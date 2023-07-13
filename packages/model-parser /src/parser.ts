import { Model, Output } from "./types";

export class ModelParser {
  private _output: Output;
  constructor(output: Output) {
    this._output = output;
  }

  get output() {
    return this._output;
  }

  get appName() {
    return this._output.name;
  }

  public getModelByName(modelName: string) {
    return this._output.models.find(
      (model) => model.modelName === modelName
    ) as Model;
  }
}
