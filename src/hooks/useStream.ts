import { useState } from "react";
import {
  FileType,
  Currency,
  WALLET,
  StreamContent,
  DecryptionConditions,
} from "@dataverse/runtime-connector";
import { useConfig } from "../context/configContext";
import { StreamsRecord } from "../types";
import { getAddressFromDid } from "../utils";
import { useUser } from "../context/userContext";
import { Model } from "@dataverse/model-parser";

export function useStream() {
  const { runtimeConnector, modelParser } = useConfig();
  const { userInfo, updateUserInfo } = useUser();
  const [streamsRecord, setStreamsRecord] = useState<StreamsRecord>({});

  const checkCapability = async () => {
    const res = await runtimeConnector.checkCapability();
    return res;
  };

  const createCapability = async (wallet: WALLET) => {
    const currentPkh = await runtimeConnector.createCapability({
      wallet,
      app: modelParser.appName,
    });
    updateUserInfo({ pkh: currentPkh });
    return currentPkh;
  };

  const loadStreams = async ({
    pkh,
    modelId,
  }: {
    pkh?: string;
    modelId: string;
  }) => {
    let streams;
    if (pkh) {
      streams = await runtimeConnector.loadStreamsBy({
        modelId,
        pkh,
      });
    } else {
      streams = await runtimeConnector.loadStreamsBy({
        modelId,
      });
    }
    setStreamsRecord(streams);
    return streams;
  };

  const createPublicStream = async ({
    model,
    stream,
  }: {
    pkh: string;
    model: Model;
    stream?: object;
  }) => {
    const modelStream = model.streams[model.streams.length - 1];
    const encrypted = {} as any;
    if (stream && Object.keys(stream).length > 0) {
      Object.keys(stream).forEach((key) => {
        encrypted[key] = false;
      });
    }

    const inputStreamContent = {
      ...stream,
      ...(!modelStream.isPublicDomain &&
        stream && {
          encrypted: JSON.stringify(encrypted),
        }),
    };
    const { pkh, modelId, streamId, streamContent } =
      await runtimeConnector.createStream({
        modelId: modelStream.modelId,
        streamContent: inputStreamContent,
      });

    if (streamContent) {
      return _updateStreamRecord({
        pkh,
        modelId,
        streamId,
        streamContent,
      });
    } else {
      throw "Failed to create stream";
    }
  };

  const createEncryptedStream = async ({
    modelId,
    stream,
    encrypted,
    requireUpdateStreamRecord = true,
  }: {
    modelId: string;
    stream: object;
    encrypted: object;
    requireUpdateStreamRecord?: boolean;
  }) => {
    const inputStreamContent = {
      ...stream,
      ...(stream && {
        encrypted: JSON.stringify(encrypted),
      }),
    };
    const { pkh, streamId, streamContent } =
      await runtimeConnector.createStream({
        modelId,
        streamContent: inputStreamContent,
      });

    if (streamContent) {
      if (requireUpdateStreamRecord) {
        return _updateStreamRecord({
          pkh,
          modelId,
          streamId,
          streamContent,
        });
      }
      return {
        streamId,
        app: modelParser.appName,
        pkh,
        modelId,
        streamContent,
      };
    } else {
      throw "Failed to create stream";
    }
  };

  const createPayableStream = async ({
    pkh,
    modelId,
    profileId,
    stream,
    lensNickName,
    currency,
    amount,
    collectLimit,
    encrypted,
  }: {
    pkh: string;
    modelId: string;
    profileId?: string;
    stream: object;
    lensNickName?: string;
    currency: Currency;
    amount: number;
    collectLimit: number;
    encrypted: object;
  }) => {
    if (!profileId) {
      profileId = await _getProfileId({ pkh, lensNickName });
    }

    const { streamId, streamContent } = await createEncryptedStream({
      modelId,
      stream,
      encrypted,
      requireUpdateStreamRecord: false,
    });

    return monetizeStream({
      pkh,
      modelId,
      lensNickName,
      streamId,
      streamContent,
      profileId,
      currency,
      amount,
      collectLimit,
    });
  };

  const monetizeStream = async ({
    pkh,
    modelId,
    streamId,
    lensNickName,
    profileId,
    streamContent,
    currency,
    amount,
    collectLimit,
    decryptionConditions,
  }: {
    pkh: string;
    modelId: string;
    streamId: string;
    lensNickName?: string;
    streamContent?: StreamContent;
    profileId?: string;
    currency: Currency;
    amount: number;
    collectLimit: number;
    decryptionConditions?: DecryptionConditions;
  }) => {
    try {
      if (!profileId) {
        profileId = await _getProfileId({ pkh, lensNickName });
      }
      if (!streamContent) {
        streamContent = streamsRecord[streamId].streamContent;
      }
      const { streamContent: updatedStreamContent } =
        await runtimeConnector.monetizeFile({
          streamId,
          indexFileId: streamContent.file.indexFileId,
          datatokenVars: {
            profileId,
            currency,
            amount,
            collectLimit,
          },
          decryptionConditions,
        });
      if (updatedStreamContent) {
        return _updateStreamRecord({
          pkh,
          modelId,
          streamId,
          streamContent: updatedStreamContent,
        });
      } else {
        throw "Failed to monetize file";
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateStream = async ({
    model,
    streamId,
    stream,
    encrypted,
  }: {
    model: Model;
    streamId: string;
    stream: object;
    encrypted?: object;
  }) => {
    const modelStream = model.streams[model.streams.length - 1];
    try {
      const fileType = streamsRecord[streamId]?.streamContent.fileType;
      if (
        !modelStream.isPublicDomain &&
        stream &&
        encrypted &&
        fileType === FileType.Public
      ) {
        for (let key in encrypted) {
          (encrypted as any)[key] = false;
        }
      }
      const inputStreamContent: StreamContent = {
        ...stream,
        encrypted: JSON.stringify(encrypted),
      };

      const { streamContent } = await runtimeConnector.updateStream({
        streamId,
        streamContent: inputStreamContent,
        syncImmediately: true,
      });

      return _updateStreamRecord({
        streamId,
        streamContent: streamContent,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const unlockStream = async (streamId: string) => {
    try {
      const { streamContent } = await runtimeConnector.unlock({
        streamId,
      });

      if (streamContent) {
        return _updateStreamRecord({
          streamId,
          streamContent,
        });
      } else {
        throw "Fail to unlock stream";
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const _getProfileId = async ({
    pkh,
    lensNickName,
  }: {
    pkh: string;
    lensNickName?: string;
  }) => {
    const lensProfiles = await runtimeConnector.getProfiles(
      getAddressFromDid(pkh)
    );

    let profileId;
    if (lensProfiles?.[0]?.id) {
      profileId = lensProfiles?.[0]?.id;
    } else {
      if (!lensNickName) {
        throw "Please pass in lensNickName";
      }
      if (!/^[\da-z]{5,26}$/.test(lensNickName) || lensNickName.length > 26) {
        throw "Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length";
      }
      profileId = await runtimeConnector.createProfile(lensNickName);
    }
    return profileId;
  };

  const _updateStreamRecord = ({
    pkh,
    modelId,
    streamId,
    streamContent,
  }: {
    pkh?: string;
    modelId?: string;
    streamId: string;
    streamContent: StreamContent;
  }) => {
    const streamsRecordCopy = JSON.parse(
      JSON.stringify(streamsRecord)
    ) as StreamsRecord;

    console.log(
      "Before update, streamsRecordCopy[streamId]:",
      streamsRecordCopy[streamId]
    );
    if (pkh && modelId) {
      streamsRecordCopy[streamId] = {
        app: modelParser.appName,
        pkh,
        modelId,
        streamContent,
      };
    } else {
      streamsRecordCopy[streamId] = {
        ...streamsRecordCopy[streamId],
        streamContent,
      };
    }
    console.log(
      "After update, streamsRecordCopy[streamId]:",
      streamsRecordCopy[streamId]
    );
    setStreamsRecord(streamsRecordCopy);

    return {
      streamId,
      app: streamsRecordCopy[streamId].app,
      pkh: pkh || streamsRecordCopy[streamId].pkh,
      modelId: modelId || streamsRecordCopy[streamId].modelId,
      streamContent,
    };
  };

  return {
    pkh: userInfo.pkh,
    streamsRecord,
    checkCapability,
    createCapability,
    loadStreams,
    createPublicStream,
    createEncryptedStream,
    createPayableStream,
    monetizeStream,
    unlockStream,
    updateStream,
  };
}
