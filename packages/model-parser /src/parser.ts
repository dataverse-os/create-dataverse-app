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
    return this._output.createDapp.name;
  }

  get appSlug() {
    return this._output.createDapp.slug;
  }

  public getModelByName(modelName: string) {
    return this._output.createDapp.streamIDs.find(
      (model) => model.name === modelName
    ) as Model;
  }
}
