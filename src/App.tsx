import "./App.css";
import React, { useState, useContext, useEffect, useRef } from "react";
import { Currency } from "@dataverse/runtime-connector";
import { useWallet, useStream } from "./hooks";
import ReactJson from "react-json-view";
import { Context } from "./context";
import { Model, StreamRecord } from "./types";
import {
  PushNotificationClient,
  PushChatClient,
  ENV,
  ModelName,
} from "@dataverse/push-client-toolkit";

import LivepeerClient, {
  LivepeerConfig,
} from "@dataverse/livepeer-client-toolkit";

import TablelandClient from "@dataverse/tableland-client-toolkit";
import { Network } from "@dataverse/tableland-client-toolkit";

function App() {
  const { appVersion, postModel, output, runtimeConnector } =
    useContext(Context);
  const [currentStreamId, setCurrentStreamId] = useState<string>();
  const [publicPost, setPublicPost] = useState<StreamRecord>();
  const [encryptedPost, setEncryptedPost] = useState<StreamRecord>();
  const [payablePost, setPayablePost] = useState<StreamRecord>();
  const [posts, setPosts] = useState<StreamRecord[]>(); // All posts
  const [updatedPost, setUpdatedPost] = useState<StreamRecord>();
  const [monetizedPost, setMonetizedPost] = useState<StreamRecord>();
  const [unlockedPost, setUnlockedPost] = useState<StreamRecord>();
  const [pushChannelModel, setPushChannelModel] = useState<Model>();
  const pushChatClientRef = useRef<PushChatClient>();
  const livepeerClientRef = useRef<LivepeerClient>();
  const tablelandClientRef = useRef<TablelandClient>();
  const [tableId, setTableId] = useState<string>();
  const [tableName, setTableName] = useState<string>();

  const { address, connectWallet, switchNetwork } = useWallet();

  useEffect(() => {
    (async () => {
      const name = output.createDapp.name;
      const slug = output.createDapp.slug;

      const pushChatMessageModel = output.createDapp.streamIDs.find(
        (item) => item.name === `${slug}_pushchatmessage`
      );

      const pushChannelModel = output.createDapp.streamIDs.find(
        (item) => item.name === `${slug}_pushchannel`
      );

      const pushChatGPGKeyModel = output.createDapp.streamIDs.find(
        (item) => item.name === `${slug}_pushchatgpgkey`
      );

      const pushnotificationModel = output.createDapp.streamIDs.find(
        (item) => item.name === `${slug}_pushnotification`
      );

      const livepeerModel = output.createDapp.streamIDs.find(
        (item) => item.name === `${slug}_livepeer`
      );

      const tablelandModel = output.createDapp.streamIDs.find(
        (item) => item.name === `${slug}_tableland`
      );

      // console.log({
      //   [ModelName.MESSAGE]: pushChatMessageModel?.stream_id!,
      //   [ModelName.USER_PGP_KEY]: pushGPGKeyModel?.stream_id!,
      //   [ModelName.CHANNEL]: pushChannelModel?.stream_id!,
      //   [ModelName.NOTIFICATION]: pushnotificationModel?.stream_id!,
      // });

      if (pushChatMessageModel) {
        const pushChatClient = new PushChatClient({
          runtimeConnector,
          modelIds: {
            [ModelName.MESSAGE]: pushChatMessageModel?.stream_id!,
            [ModelName.USER_PGP_KEY]: pushChatGPGKeyModel?.stream_id!,
            [ModelName.CHANNEL]: pushChannelModel?.stream_id!,
            [ModelName.NOTIFICATION]: pushnotificationModel?.stream_id!,
          },
          appName: output.createDapp.name,
          env: ENV.STAGING,
        });
        pushChatClientRef.current = pushChatClient;
      }

      // if (tablelandModel) {
      const tablelandClient = new TablelandClient({
        runtimeConnector,
        network: Network.MUMBAI,
      });
      tablelandClientRef.current = tablelandClient;
      // }

      if (livepeerModel) {
        const livepeerClient = new LivepeerClient({
          apiKey: "69ecb5ef-9f70-41f3-8a65-1bac0de4eff7",
          runtimeConnector,
          modelId: livepeerModel.stream_id,
          appName: name,
        });
        livepeerClientRef.current = livepeerClient;
      }

      if (pushChannelModel) {
        setPushChannelModel(pushChannelModel);
      }
    })();
  }, []);

  const {
    pkh,
    createCapability,
    loadStreams,
    createPublicStream,
    createEncryptedStream,
    createPayableStream,
    monetizeStream,
    unlockStream,
    updateStream,
  } = useStream();

  const connect = async () => {
    const { wallet } = await connectWallet();
    const pkh = await createCapability(wallet);
    console.log("pkh:", pkh);
    return pkh;
  };

  const createPublicPost = async () => {
    const date = new Date().toISOString();
    const { streamId, ...streamRecord } = await createPublicStream({
      pkh,
      model: pushChannelModel as Model,
      stream: {
        channel: "test",
        ipfshash: "bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4",
        // appVersion,
        // text: "hello",
        // images: [
        //   "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link",
        // ],
        // videos: [],
        // createdAt: date,
        // updatedAt: date,
      },
    });

    setCurrentStreamId(streamId);
    setPublicPost(streamRecord as StreamRecord);
  };

  const createEncryptedPost = async () => {
    const date = new Date().toISOString();
    const { streamId, ...streamRecord } = await createEncryptedStream({
      model: pushChannelModel as Model,
      stream: {
        channel: "test",
        ipfshash: "bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4",
        // appVersion,
        // text: "hello",
        // images: [
        //   "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link",
        // ],
        // videos: [],
        // createdAt: date,
        // updatedAt: date,
      },
      encrypted: {
        channel: true,
        ipfshash: true,
        // text: true,
        // images: true,
        // videos: false,
      },
    });

    setCurrentStreamId(streamId);
    setEncryptedPost(streamRecord as StreamRecord);
  };

  const createPayablePost = async () => {
    const date = new Date().toISOString();
    const { streamId, ...streamRecord } = await createPayableStream({
      pkh,
      // model: postModel,
      model: pushChannelModel as Model,
      stream: {
        channel: "test",
        ipfshash: "bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4",
        // appVersion,
        // text: "metaverse",
        // images: [
        //   "https://bafkreidhjbco3nh4uc7wwt5c7auirotd76ch6hlzpps7bwdvgckflp7zmi.ipfs.w3s.link/",
        // ],
        // videos: [],
        // createdAt: date,
        // updatedAt: date,
      },
      lensNickName: "luketheskywalker1", //Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length
      currency: Currency.WMATIC,
      amount: 0.0001,
      collectLimit: 1000,
      encrypted: {
        channel: false,
        ipfshash: false,
        // text: true,
        // images: true,
        // videos: false,
      },
    });

    setCurrentStreamId(streamId);
    setPayablePost(streamRecord as StreamRecord);
  };

  const loadPosts = async () => {
    const postRecord = await loadStreams({
      pkh,
      modelId: (pushChannelModel as Model).stream_id,
    });
    console.log("loadPosts postRecord:", postRecord);
    setPosts(Object.values(postRecord));
  };

  const updatePost = async () => {
    if (!currentStreamId) {
      return;
    }
    const { streamId, ...streamRecord } = await updateStream({
      model: pushChannelModel as Model,
      // model: postModel,
      streamId: currentStreamId,
      stream: {
        channel: "test2",
        ipfshash: "bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl5",
        // text: "update my post -- " + new Date().toISOString(),
        // images: [
        //   "https://bafkreidhjbco3nh4uc7wwt5c7auirotd76ch6hlzpps7bwdvgckflp7zmi.ipfs.w3s.link",
        // ],
      },
      encrypted: {
        channel: false,
        ipfshash: false,
        // text: true, images: true, videos: false
      },
    });

    setUpdatedPost(streamRecord as StreamRecord);
  };

  const monetizePost = async () => {
    if (!currentStreamId) {
      return;
    }
    const { streamId, ...streamRecord } = await monetizeStream({
      pkh,
      modelId: (pushChannelModel as Model).stream_id,
      // modelId: postModel.stream_id,
      streamId: currentStreamId,
      lensNickName: "jackieth", //Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length
      currency: Currency.WMATIC,
      amount: 0.0001,
      collectLimit: 1000,
    });

    setMonetizedPost(streamRecord as StreamRecord);
  };

  const unlockPost = async () => {
    if (!currentStreamId) {
      return;
    }
    const { streamId, ...streamRecord } = await unlockStream(currentStreamId);

    setUnlockedPost(streamRecord as StreamRecord);
  };

  const createPushChatUser = async () => {
    const user = await pushChatClientRef.current?.createPushChatUser();
    console.log("CreatePushChatUser: response: ", user);
  };

  const sendChatMessage = async () => {
    const msgCont = "chatMsg";
    const msgType = "Text";
    const receiver = "0x6ed14ee482d3C4764C533f56B90360b767d21D5E";

    const response = await pushChatClientRef.current?.sendChatMessage(
      receiver,
      msgCont,
      msgType
    );

    console.log("SendMsg: response: ", response);
  };

  const fetchHistoryChats = async () => {
    const receiver = "0x6ed14ee482d3C4764C533f56B90360b767d21D5E";
    const limit = 30;

    const response = await pushChatClientRef.current?.fetchHistoryChats(
      receiver,
      limit
    );

    console.log("FetchHistoryChats: response: ", response);
  };

  const createTable = async () => {
    await switchNetwork(80001);

    const CREATE_TABLE_SQL =
      "CREATE TABLE test_table (id integer primary key, record text)";
    console.log(tablelandClientRef.current);
    const res = await tablelandClientRef.current?.createTable(
      address!,
      CREATE_TABLE_SQL
    );
    setTableId(res?.tableId);
    setTableName(`${res?.tableName}_${res?.chainId}_${res?.tableId}`);
    console.log("CreateTable: response: ", res);
  };

  const insertTable = async () => {
    const MUTATE_TABLE_SQL = `INSERT INTO ${tableName} (id, record) values(1, 'hello man01')`;

    const res = await tablelandClientRef.current?.mutateTable(
      address!,
      tableId!,
      MUTATE_TABLE_SQL
    );
    console.log("InsertTable: response: ", res);
  };

  const updateTable = async () => {
    const UPDATE_TABLE_SQL = `UPDATE ${tableName} SET record = 'hello man02' WHERE id = 1`;

    const res = await tablelandClientRef.current?.mutateTable(
      address!,
      tableId!,
      UPDATE_TABLE_SQL
    );
    console.log("UpdateTable: response: ", res);
  };

  const getTableByTableId = async () => {
    const tablelandClient = tablelandClientRef.current;
    const tableName = await tablelandClient?.getTableNameById(tableId!);
    if (tableName) {
      const result = await tablelandClient?.getTableByName(tableName);
      console.log("GetTableByTableId:", result);
    } else {
      console.error("getTableNameById failed");
    }
  };

  const retrieveAssetById = async () => {
    const res = await livepeerClientRef.current?.retrieveAssetById(
      "be869964-4ec4-4652-bb5b-22a09112d717"
    );
    console.log("retrieveAssetById res:", res);
  };

  const retrieveAssets = async () => {
    const res = await livepeerClientRef.current?.retrieveAssets();
    console.log("retrieveAssets res:", res);
  };

  const deleteAssetById = async () => {
    await livepeerClientRef.current?.deleteAssetById(
      "5561fd95-cc5b-47a9-bb79-d6d460f79883"
    );
  };

  const createAssetMetaStream = async () => {
    const asset = {
      id: "fd926a0a-9a1d-481c-9320-3f660f6c583c",
      hash: [
        {
          hash: "59b8487da4236b3d42890fedab86ac64",
          algorithm: "md5",
        },
        {
          hash: "ce4bfdc8fda0c1a3393dbb6850de2bee1f44e9be6839a377499009dde493a1f8",
          algorithm: "sha256",
        },
      ],
      name: "SampleVideo_360x240_1mb.mp4",
      size: 1053651,
      source: {
        type: "directUpload",
      },
      status: {
        phase: "ready",
        updatedAt: 1686288965902,
      },
      userId: "465c2ff6-de57-43e1-a2c8-2ef60413ea95",
      createdAt: 1686288914975,
      videoSpec: {
        format: "mp4",
        duration: 13.696,
      },
      playbackId: "fd92jdwxbill3hye",
      playbackUrl: "https://lp-playback.com/hls/fd92jdwxbill3hye/index.m3u8",
      downloadUrl: "https://lp-playback.com/hls/fd92jdwxbill3hye/video",
    };

    await livepeerClientRef.current?.createAssetMetaStream(asset);
    console.log("AssetMetaStream created.");
  };

  const removeAssetMetaStreamByAssetId = async () => {
    const assetId = "6f8e2e9c-7670-4777-ac08-d558045ff44f";
    await livepeerClientRef.current?.removeAssetMetaStreamByAssetId(assetId);
    console.log("AssetMetaStream removed.");
  };

  const updateAssetMetaStream = async () => {
    const asset = {
      id: "dd3565d4-24eb-46bf-8116-99b7991b791d",
      hash: [
        {
          hash: "59b8487da4236b3d42890fedab86ac64",
          algorithm: "md5",
        },
        {
          hash: "ce4bfdc8fda0c1a3393dbb6850de2bee1f44e9be6839a377499009dde493a1f8",
          algorithm: "sha256",
        },
      ],
      name: "SampleVideo_360x240_1mb.mp4",
      size: 1053651,
      source: {
        type: "directUpload2",
      },
      status: {
        phase: "ready",
        updatedAt: 1686309267324,
      },
      userId: "465c2ff6-de57-43e1-a2c8-2ef60413ea95",
      createdAt: 1686309229112,
      videoSpec: {
        format: "mp4",
        duration: 13.696,
      },
      playbackId: "dd35xm3cf3s1h5kk",
      playbackUrl: "https://lp-playback.com/hls/dd35xm3cf3s1h5kk/index.m3u8",
      downloadUrl: "https://lp-playback.com/hls/dd35xm3cf3s1h5kk/video",
    };
    await livepeerClientRef.current?.updateAssetMetaStream(asset);
    console.log("AssetMetaStream updated.");
  };

  return (
    <div className="App">
      <button onClick={connect}>connect</button>
      <div className="blackText">{pkh}</div>
      <hr />
      <button onClick={createPublicPost}>createPublicPost</button>
      {publicPost && (
        <div className="json-view">
          <ReactJson src={publicPost} collapsed={true} />
        </div>
      )}
      <button onClick={createEncryptedPost}>createEncryptedPost</button>
      {encryptedPost && (
        <div className="json-view">
          <ReactJson src={encryptedPost} collapsed={true} />
        </div>
      )}
      <button onClick={createPayablePost}>createPayablePost</button>
      {payablePost && (
        <div className="json-view">
          <ReactJson src={payablePost} collapsed={true} />
        </div>
      )}
      <div className="red">
        You need a testnet lens profile to monetize data.
      </div>
      <button onClick={loadPosts}>loadPosts</button>
      {posts && (
        <div className="json-view">
          <ReactJson src={posts} collapsed={true} />
        </div>
      )}
      <button onClick={updatePost}>updatePost</button>
      {updatedPost && (
        <div className="json-view">
          <ReactJson src={updatedPost} collapsed={true} />
        </div>
      )}
      <button onClick={monetizePost}>monetizePost</button>
      {monetizedPost && (
        <div className="json-view">
          <ReactJson src={monetizedPost} collapsed={true} />
        </div>
      )}
      <button onClick={unlockPost}>unlockPost</button>
      {unlockedPost && (
        <div className="json-view">
          <ReactJson src={unlockedPost} collapsed={true} />
        </div>
      )}
      <br />
      <button onClick={createPushChatUser}>createPushChatUser</button>
      <button onClick={sendChatMessage}>sendChatMessage</button>
      <button onClick={fetchHistoryChats}>fetchHistoryChats</button>
      <br />
      <button onClick={createTable}>createTable</button>
      <button onClick={insertTable}>insertTable</button>
      <button onClick={updateTable}>updateTable</button>
      <button onClick={getTableByTableId}>getTableByTableId</button>
      <br />
      {/* <LivepeerPlayer reactClient={livePeerClient.reactClient} /> */}
      {livepeerClientRef.current?.reactClient && (
        <LivepeerConfig client={livepeerClientRef.current?.reactClient!}>
          <button onClick={retrieveAssetById}>retrieveAssetById</button>
          <button onClick={retrieveAssets}>retrieveAssets</button>
          <button onClick={deleteAssetById}>deleteAssetById</button>
          <button onClick={createAssetMetaStream}>createAssetMetaStream</button>
          <button onClick={removeAssetMetaStreamByAssetId}>
            removeAssetMetaStreamByAssetId
          </button>
          <button onClick={updateAssetMetaStream}>updateAssetMetaStream</button>
        </LivepeerConfig>
      )}
    </div>
  );
}

export default App;
