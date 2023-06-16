import React, { useState } from "react";
import { useCreateAsset, useUpdateAsset } from "@livepeer/react";
import LivepeerClient from "@dataverse/livepeer-client-toolkit";
import { Currency } from "@dataverse/runtime-connector";

interface IProps {
  address?: string;
  livepeerClient: LivepeerClient;
  asset: any;
  setAsset: Function;
}

export const LivepeerWidget = ({
  address,
  livepeerClient,
  asset,
  setAsset,
}: IProps) => {
  const [loading, setLoading] = useState(false);
  const [fileInput, setFileInput] = useState<any>(null);
  const [streamId, setStreamId] = useState<string>();
  const { mutateAsync: createAssetAsync } = useCreateAsset(
    fileInput
      ? {
          sources: [{ name: fileInput.name, file: fileInput }],
        }
      : null
  );

  const { mutateAsync: updateAssetAsync } = useUpdateAsset(
    asset
      ? {
          assetId: asset.id,
          storage: { ipfs: true },
        }
      : null
  );

  const handleFileUpload = async () => {
    // stream name input check empty
    if (!fileInput) throw new Error("Please select a file");
    try {
      setLoading(true);
      const asset = await createAssetAsync();
      console.log("created asset:", asset);
      if (!asset) {
        throw new Error("Asset undefined");
      }
      if ((asset[0] as any).status.errorMessage) {
        throw new Error((asset[0] as any).status.errorMessage);
      }
      const res = await livepeerClient.persistAssetMeta(asset[0]);
      console.log("livepeerClient createAssetMeta res: ", res);
      setStreamId(res.streamId);
      setAsset(asset[0]);
      console.log("File uploaded successfully");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error while uploading file:", err);
    }
  };

  const uploadFileToIpfs = async () => {
    // stream name input check empty
    if (!asset) throw new Error("Please create asset first");
    try {
      setLoading(true);
      const asset = await updateAssetAsync();
      console.log("updated asset:", asset);
      if (!asset) {
        throw new Error("Asset undefined");
      }
      const res = await livepeerClient.persistAssetMeta(asset);
      console.log("livepeerClient updateAssetMeta res: ", res);
      setAsset(asset);
      console.log("Asset saved to Ipfs successfully");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error while saving asset to Ipfs:", err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileInput(files[0]);
    } else {
      setFileInput(null);
    }
  };

  const getAssetMetaList = async () => {
    const res = await livepeerClient.getAssetMetaList();
    console.log("getAssetMetaList res:", res);
  };

  const monetizeAssetMeta = async () => {
    if (!streamId || !address) {
      console.error("streamId or address undefined");
      return;
    }
    await livepeerClient.monetizeAssetMeta({
      address,
      streamId,
      lensNickName: "jackieth",
      datatokenVars: {
        currency: Currency.WMATIC,
        amount: 0.0001,
        collectLimit: 1000,
      },
    });
    console.log("monetizeAssetMeta success.");
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        className="upload"
        accept="video/*"
      />
      <button onClick={handleFileUpload} disabled={loading}>
        UploadToLivepeer
      </button>
      <button onClick={uploadFileToIpfs} disabled={loading}>
        UploadFileToIpfs
      </button>
      <button onClick={getAssetMetaList}>getAssetMetaList</button>
      <button onClick={monetizeAssetMeta}>monetizeAssetMeta</button>
    </div>
  );
};
