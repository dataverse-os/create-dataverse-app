export interface Model {
  name: string;
  stream_id: string;
  isPublicDomain: boolean;
  encryptable?: string[];
}

export interface Output {
  createDapp: {
    id: string;
    streamIDs: Model[];
    website: string;
    name: string;
    slug: string;
    logo: string;
    description: string;
    defaultFolderName: string;
  };
}
