import { StreamContent } from "@dataverse/runtime-connector";

export interface StreamsRecord {
  [streamId: string]: StreamRecord;
}

export interface StreamRecord {
  app: string;
  pkh: string;
  modelId: string;
  streamContent: StreamContent;
}
