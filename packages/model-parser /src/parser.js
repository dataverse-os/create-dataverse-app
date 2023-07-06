export class ModelParser {
    constructor(output) {
        Object.defineProperty(this, "_output", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    getModelByName(modelName) {
        return this._output.createDapp.streamIDs.find((model) => model.name === modelName);
    }
}
