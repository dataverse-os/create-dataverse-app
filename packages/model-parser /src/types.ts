export interface Model {
  modelName: string;
  internal: boolean;
  streams: {
    modelId: string;
    createdAt: number;
    schema: string;
    isPublicDomain: boolean;
    encryptable: string[];
    version: number;
    latest: boolean;
  }[]
}

export interface Output {
  id: string;
  createdAt: number;
  updatedAt: number | null;
  deletedAt: number | null;
  name: string;
  logo: string;
  website: string[];
  defaultFolderName: string;
  description: string;
  models: Model[];
  address: string;
  ceramic: string;
}
