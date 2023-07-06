import { Model, Output } from "./types";
export declare class ModelParser {
    private _output;
    constructor(output: Output);
    get output(): Output;
    get appName(): string;
    get appSlug(): string;
    getModelByName(modelName: string): Model;
}
