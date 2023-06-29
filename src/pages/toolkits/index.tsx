import React, { useState, useContext, useEffect, useRef } from "react";
import { useWallet, useStream } from "../../hooks";
import { useConfig } from "../../context/configContext";
import { Model } from "../../types";
import {
  PushNotificationClient,
  PushChatClient,
  ENV,
  ModelType as PushModelType,
  getICAPAddress,
} from "@dataverse/push-client-toolkit";

import LivepeerClient, {
  LivepeerConfig,
} from "@dataverse/livepeer-client-toolkit";

import XmtpClient, {
  ModelType as XmtpModelType,
} from "@dataverse/xmtp-client-toolkit";

import TablelandClient, { Network } from "@dataverse/tableland-client-toolkit";
import LensClient, {
  CommentData,
  LensNetwork,
  MirrorData,
  ModelType as LensModelType,
  PostData,
} from "@dataverse/lens-client-toolkit";

import SnapshotClient, {
  ModelType as snapshotModelType,
  SNAP_SHOT_HUB,
  OrderDirection, GetActionParams, State, GetProposalsParams, Strategy, now, Proposal, Vote
} from "@dataverse/snapshot-client-toolkit"

import { LivepeerWidget, LivepeerPlayer } from "../../components/Livepeer";
import { getModelByName } from "../../utils";
import { ethers } from "ethers";
import ReactJson from "react-json-view";

const TEN_MINUTES = 10 * 60;

function Toolkits() {
  const { runtimeConnector, output } = useConfig();
  const [pushChannelModel, setPushChannelModel] = useState<Model>();
  const pushChatClientRef = useRef<PushChatClient>();
  const pushNotificationClientRef = useRef<PushNotificationClient>();
  const livepeerClientRef = useRef<LivepeerClient>();
  const tablelandClientRef = useRef<TablelandClient>();
  const xmtpClientRef = useRef<XmtpClient>();
  const lensClientRef = useRef<LensClient>();
  const snapshotClientRef = useRef<SnapshotClient>();
  const [tableId, setTableId] = useState<string>();
  const [tableName, setTableName] = useState<string>();
  const [asset, setAsset] = useState<any>(null);
  const [profileId, setProfileId] = useState<string>();

  const [spaceActions, setSpaceActions] = useState<Object[]>();
  const [spaceId, setSpaceId] = useState<string>();
  const [proposals, setProposals] = useState<Object[]>();
  const [proposalId, setProposalId] = useState<string>();
  const [sId, setSId] = useState<string>();

  const { address, connectWallet, switchNetwork } = useWallet();
  const { pkh, createCapability } = useStream();

  useEffect(() => {
    const appName = output.createDapp.name;
    const appSlug = output.createDapp.slug;

    const pushChatMessageModel = getModelByName(`${appSlug}_pushchatmessage`);

    const pushChannelModel = getModelByName(`${appSlug}_pushchannel`);

    const pushChatGPGKeyModel = getModelByName(`${appSlug}_pushchatgpgkey`);

    const pushNotificationModel = getModelByName(`${appSlug}_pushnotification`);

    const livepeerModel = getModelByName(`${appSlug}_livepeerasset`);

    const tablelandModel = getModelByName(`${appSlug}_table`);

    const xmtpkeycacheModel = getModelByName(`${appSlug}_xmtpkeycache`);

    const xmtpmessageModel = getModelByName(`${appSlug}_xmtpmessage`);

    const lenspostModel = getModelByName(`${appSlug}_lenspublication`);

    const lenscollectionModel = getModelByName(`${appSlug}_lenscollection`);

    const snapshotproposalModel = getModelByName(`${appSlug}_snapshotproposal`);

    const snapshotvoteModel = getModelByName(`${appSlug}_snapshotvote`);

    if (pushChatMessageModel) {
      const pushChatClient = new PushChatClient({
        runtimeConnector,
        modelIds: {
          [PushModelType.MESSAGE]: pushChatMessageModel?.stream_id!,
          [PushModelType.USER_PGP_KEY]: pushChatGPGKeyModel?.stream_id!,
          [PushModelType.CHANNEL]: pushChannelModel?.stream_id!,
          [PushModelType.NOTIFICATION]: pushNotificationModel?.stream_id!,
        },
        appName: output.createDapp.name,
        env: ENV.STAGING,
      });
      pushChatClientRef.current = pushChatClient;
    }

    if (pushNotificationModel) {
      const pushNotificationClient = new PushNotificationClient({
        runtimeConnector,
        modelIds: {
          [PushModelType.MESSAGE]: pushChatMessageModel?.stream_id!,
          [PushModelType.USER_PGP_KEY]: pushChatGPGKeyModel?.stream_id!,
          [PushModelType.CHANNEL]: pushChannelModel?.stream_id!,
          [PushModelType.NOTIFICATION]: pushNotificationModel?.stream_id!,
        },
        appName: output.createDapp.name,
        env: ENV.STAGING,
      });
      pushNotificationClientRef.current = pushNotificationClient;
    }

    if (tablelandModel) {
      const tablelandClient = new TablelandClient({
        runtimeConnector,
        network: Network.MUMBAI,
        modelId: tablelandModel?.stream_id,
      });
      tablelandClientRef.current = tablelandClient;
    }

    if (livepeerModel) {
      const livepeerClient = new LivepeerClient({
        apiKey: (import.meta as any).env.VITE_LIVEPEER_API_KEY,
        runtimeConnector,
        modelId: livepeerModel.stream_id,
      });
      livepeerClientRef.current = livepeerClient;
    }

    if (pushChannelModel) {
      setPushChannelModel(pushChannelModel);
    }

    if (xmtpkeycacheModel && xmtpmessageModel) {
      const xmtpClient = new XmtpClient({
        runtimeConnector,
        appName,
        modelIds: {
          [XmtpModelType.MESSAGE]: xmtpmessageModel.stream_id,
          [XmtpModelType.KEYS_CACHE]: xmtpkeycacheModel.stream_id,
        },
        env: "production",
      });
      xmtpClientRef.current = xmtpClient;
    }

    if (lenspostModel && lenscollectionModel) {
      const lensClient = new LensClient({
        modelIds: {
          [LensModelType.Publication]: lenspostModel.stream_id,
          [LensModelType.Collection]: lenscollectionModel.stream_id,
        },
        runtimeConnector,
        network: LensNetwork.MumbaiTestnet,
      });
      lensClientRef.current = lensClient;
    }

    if (snapshotproposalModel) {
      console.log("streamId : ", snapshotproposalModel?.stream_id!, snapshotvoteModel?.stream_id! )
      const snapshotClient = new SnapshotClient({
        runtimeConnector,
        modelIds: {
          [snapshotModelType.PROPOSAL]: snapshotproposalModel?.stream_id!,
          [snapshotModelType.VOTE]: snapshotvoteModel?.stream_id!,
        },
        env: SNAP_SHOT_HUB.dev,
      });
      snapshotClientRef.current = snapshotClient;
    }
  }, []);

  const connect = async () => {
    const { wallet } = await connectWallet();
    const pkh = await createCapability(wallet);
    console.log("pkh:", pkh);
    return pkh;
  };

  // Push Notifications
  const getUserSubscriptions = async () => {
    if (!address) {
      throw new Error("address undefined");
    }
    const subscriptions =
      await pushNotificationClientRef.current?.getSubscriptionsByUser(address);
    console.log("[getUserSubscriptions]subscriptions:", subscriptions);
  };

  const getUserSpamNotifications = async () => {
    if (!address) {
      throw new Error("address undefined");
    }
    const spams =
      await pushNotificationClientRef.current?.getUserSpamNotifications(
        getICAPAddress(address)
      );
    console.log("[getUserSpamNotifications]notifications:", spams);
  };

  const getNotificationsByUser = async () => {
    const notifications =
      await pushNotificationClientRef.current?.getNotificationsByUser(
        address!,
        1,
        100
      );
    console.log("[getNotificationsByUser]notifications:", notifications);
  };

  const subscribe = async () => {
    const subscribeChannel =
      "eip155:5:0xd10d5b408A290a5FD0C2B15074995e899E944444";
    try {
      await pushNotificationClientRef.current?.subscribeChannel(
        subscribeChannel
      );
      console.log("[subscribe]done");
    } catch (error) {
      console.error(error);
    }
  };

  const unsubscribe = async () => {
    const subscribeChannel =
      "eip155:5:0xd10d5b408A290a5FD0C2B15074995e899E944444";
    try {
      await pushNotificationClientRef.current?.unsubscribeChannel(
        subscribeChannel
      );
      console.log("[unsubscribe]done");
    } catch (error) {
      console.error(error);
    }
  };

  const sendNotification = async () => {
    const sendChannel = "eip155:5:0xd10d5b408A290a5FD0C2B15074995e899E944444";
    const title = "Hello Title";
    const body = "Tom long time no see.";
    const img =
      "https://bafkreicf7ynxjjjumhrntswhtqbnkjvi24zqw3ubuvbeie3nzrylyyovye.ipfs.dweb.link";
    const cta = "";

    try {
      const res = await pushNotificationClientRef.current?.sendNotification(
        sendChannel,
        title,
        body,
        img,
        cta
      );
      console.log("[sendNotification]res:", res);
    } catch (error: any) {
      if (error?.message === "this account does not have channel") {
        console.error(
          "This Account doesn't have channel, please go to https://staging.push.org/ to create channel."
        );
      } else if (
        error?.response?.data?.error?.info ===
        "Error while verifying the verificationProof through eip712v2"
      ) {
        console.error(
          "This Account doesn't have permission to sendNotification, please use your own channel to sendNotification or create a channel on https://staging.push.org/."
        );
      }
    }
  };

  const getChannelDetail = async () => {
    const detailChannel = "eip155:5:0xd10d5b408A290a5FD0C2B15074995e899E944444";
    const channelData =
      await pushNotificationClientRef.current?.getChannelDetail(detailChannel);
    console.log("[getChannelDetail]channelData:", channelData);
  };

  const getSubscriberOfChannel = async () => {
    const queryChannel = "eip155:5:0xd10d5b408A290a5FD0C2B15074995e899E944444";
    const page = 1;
    const limit = 10;
    const subscribers =
      await pushNotificationClientRef.current?.getSubscriberOfChannel(
        queryChannel,
        page,
        limit
      );
    console.log("[getSubscriberOfChannel]subscribers:", subscribers);
  };

  const searchChannelByName = async () => {
    const searchName = "DataverseChannel";
    const channelsData =
      await pushNotificationClientRef.current?.searchChannelByName(
        searchName,
        1,
        10
      );
    console.log("[searchChannelByName]channelsData:", channelsData);
  };

  const getNotificationList = async () => {
    const noticeList =
      await pushNotificationClientRef.current?.getNotificationList();
    console.log("getNotificationList: ", noticeList);
  };

  // Push Chat
  const createPushChatUser = async () => {
    const user = await pushChatClientRef.current?.createPushChatUser();
    console.log("CreatePushChatUser: response: ", user);
  };

  const sendChatMessage = async () => {
    const msgCont = "Someting content";
    const msgType = "Text";
    const receiver = "0x13a6D1fe418de7e5B03Fb4a15352DfeA3249eAA4";

    const response = await pushChatClientRef.current?.sendChatMessage(
      receiver,
      msgCont,
      msgType
    );

    console.log("sendChatMessage: response: ", response);
  };

  const fetchHistoryChats = async () => {
    const receiver = "0x13a6D1fe418de7e5B03Fb4a15352DfeA3249eAA4";
    const limit = 30;

    const response = await pushChatClientRef.current?.fetchHistoryChats(
      receiver,
      limit
    );

    console.log("FetchHistoryChats: response: ", response);
  };

  const getChatMessageList = async () => {
    const msgList = await pushChatClientRef.current?.getMessageList();
    console.log("ChatMessageList: response: ", msgList);
  };

  // Tableland
  const createTable = async () => {
    await switchNetwork(80001);

    const CREATE_TABLE_SQL =
      "CREATE TABLE test_table (id integer primary key, record text)";
    console.log(tablelandClientRef.current);
    const res = await tablelandClientRef.current?.createTable(CREATE_TABLE_SQL);
    setTableId(res?.tableId);
    setTableName(`${res?.tableName}_${res?.chainId}_${res?.tableId}`);
    console.log("CreateTable: response: ", res);
  };

  const insertTable = async () => {
    const MUTATE_TABLE_SQL = `INSERT INTO ${tableName} (id, record) values(1, 'hello man01')`;

    const res = await tablelandClientRef.current?.mutateTable(
      tableId!,
      MUTATE_TABLE_SQL
    );
    console.log("InsertTable: response: ", res);
  };

  const updateTable = async () => {
    const UPDATE_TABLE_SQL = `UPDATE ${tableName} SET record = 'hello man02' WHERE id = 1`;

    const res = await tablelandClientRef.current?.mutateTable(
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

  const getTableList = async () => {
    const tablelandClient = tablelandClientRef.current;
    const tables = await tablelandClient?.getTableList();
    console.log("tables: ", tables);
  };

  // Xmtp
  const isUserOnNetwork = async () => {
    const isOnNetwork = await xmtpClientRef.current?.isUserOnNetwork(
      address,
      "production"
    );
    console.log("isUserOnNetwork:", isOnNetwork);
  };

  const sendMessageToMsgReceiver = async () => {
    const msgReceiver = "0x13a6D1fe418de7e5B03Fb4a15352DfeA3249eAA4";

    const res = await xmtpClientRef.current?.sendMessageTo({
      user: msgReceiver,
      msg: "Hello! Nice to meet you.",
    });
    console.log("[sendMessageToMsgReceiver]res:", res);
  };

  const getMessageWithMsgReceiver = async () => {
    const msgReceiver = "0x13a6D1fe418de7e5B03Fb4a15352DfeA3249eAA4";

    const msgList = await xmtpClientRef.current?.getMessageWithUser({
      user: msgReceiver,
      options: {
        endTime: new Date(),
      },
    });
    console.log("getMessageWithMsgReceiver res:", msgList);
  };

  const getPersistedMessages = async () => {
    const res = await xmtpClientRef.current?.getPersistedMessages();
    console.log("getPersistedMessages res:", res);
  };

  // Lens
  const createProfile = async () => {
    if (!address) {
      return;
    }
    const handle = "nickname" + Date.now();
    if (!/^[\da-z]{5,26}$/.test(handle) || handle.length > 26) {
      throw "Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length";
    }
    const res = await lensClientRef.current?.createProfile({
      to: address,
      handle,
      imageURI:
        "https://gateway.ipfscdn.io/ipfs/QmQPuXJ7TTg7RpNjHeAR4NrGtDVSAwoP2qD4VdZF2vAJiR",
    });
    console.log("createProfile res:", res);
  };

  const getProfiles = async () => {
    if (!address) {
      return;
    }
    console.log("lensClientRef.current:", lensClientRef.current)
    const res = await lensClientRef.current?.getProfiles(address);
    console.log("[getprofiles]res:", res);
    if (res.length > 0) {
      setProfileId(res[res.length - 1].id);
    }
  };

  const post = async () => {
    if (!profileId) {
      return;
    }
    const collectModule =
      lensClientRef.current?.lensContractsAddress.FreeCollectModule;
    const collectModuleInitData = ethers.utils.defaultAbiCoder.encode(
      ["bool"],
      [false]
    ) as any;
    const postData: PostData = {
      profileId,
      contentURI: "https://dataverse-os.com/",
      collectModule,
      collectModuleInitData,
      referenceModule: ethers.constants.AddressZero,
      referenceModuleInitData: [],
    };
    const res = await lensClientRef.current?.post(postData);
    console.log("post res:", res);
  };

  const postWithSig = async () => {
    if (!profileId) {
      return;
    }
    const collectModule =
      lensClientRef.current?.lensContractsAddress.FreeCollectModule;
    const collectModuleInitData = ethers.utils.defaultAbiCoder.encode(
      ["bool"],
      [false]
    ) as any;
    const postData: PostData = {
      profileId,
      contentURI: "https://dataverse-os.com/",
      collectModule,
      collectModuleInitData,
      referenceModule: ethers.constants.AddressZero,
      referenceModuleInitData: [],
    };
    const res = await lensClientRef.current?.postWithSig(postData);
    console.log("postWithSig res:", res);
  };

  const comment = async () => {
    if (!profileId) {
      return;
    }
    const profileIdPointed = "0x80e4";
    const pubIdPointed = "0x10";
    const referenceModule = await lensClientRef.current?.getReferenceModule({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });
    // followerOnly: false
    const collectModuleInitData = ethers.utils.defaultAbiCoder.encode(
      ["bool"],
      [false]
    ) as any;
    const collectModule = await lensClientRef.current?.getCollectModule({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });

    const commentData: CommentData = {
      profileId,
      contentURI: "https://github.com/dataverse-os",
      profileIdPointed,
      pubIdPointed,
      referenceModuleData: [],
      collectModule: collectModule!,
      collectModuleInitData,
      referenceModule: referenceModule!,
      referenceModuleInitData: [],
    };
    const res = await lensClientRef.current?.comment(commentData);
    console.log("comment res:", res);
  };

  const commentWithSig = async () => {
    if (!profileId) {
      return;
    }
    const profileIdPointed = "0x80e4";
    const pubIdPointed = "0x10";
    const referenceModule = await lensClientRef.current?.getReferenceModule({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });
    // followerOnly: false
    const collectModuleInitData = ethers.utils.defaultAbiCoder.encode(
      ["bool"],
      [false]
    ) as any;
    const collectModule = await lensClientRef.current?.getCollectModule({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });

    const commentData: CommentData = {
      profileId,
      contentURI: "https://github.com/dataverse-os",
      profileIdPointed,
      pubIdPointed,
      referenceModuleData: [],
      collectModule: collectModule!,
      collectModuleInitData,
      referenceModule: referenceModule!,
      referenceModuleInitData: [],
    };
    const res = await lensClientRef.current?.commentWithSig(commentData);
    console.log("commentWithSig res:", res);
  };

  const mirror = async () => {
    if (!profileId) {
      return;
    }
    const profileIdPointed = "0x80e4";
    const pubIdPointed = "0x10";
    const referenceModule = await lensClientRef.current?.getReferenceModule({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });
    const mirrorData: MirrorData = {
      profileId,
      profileIdPointed,
      pubIdPointed,
      referenceModuleData: [],
      referenceModule: referenceModule!,
      referenceModuleInitData: [],
    };
    const res = await lensClientRef.current?.mirror(mirrorData);
    console.log("[mirror]res:", res);
  };

  const mirrorWithSig = async () => {
    if (!profileId) {
      return;
    }
    const profileIdPointed = "0x80e4";
    const pubIdPointed = "0x10";
    const referenceModule = await lensClientRef.current?.getReferenceModule({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });
    const mirrorData: MirrorData = {
      profileId,
      profileIdPointed,
      pubIdPointed,
      referenceModuleData: [],
      referenceModule: referenceModule!,
      referenceModuleInitData: [],
    };
    const res = await lensClientRef.current?.mirrorWithSig(mirrorData);
    console.log("[mirrorWithSig]res:", res);
  };

  const collect = async () => {
    if (!profileId) {
      return;
    }
    const profileIdPointed = "0x80e4";
    const pubIdPointed = "0x10";
    const res = await lensClientRef.current?.collect({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });
    console.log("[collect]res:", res);
  };

  const collectWithSig = async () => {
    if (!profileId) {
      return;
    }
    const profileIdPointed = "0x80e4";
    const pubIdPointed = "0x10";
    const res = await lensClientRef.current?.collectWithSig({
      profileId: profileIdPointed,
      pubId: pubIdPointed,
    });
    console.log("[collectWithSig]res:", res);
  };

  const getPersistedPublications = async () => {
    const res = await lensClientRef.current?.getPersistedPublications();
    console.log("[getPersistedPublications]res:", res);
  }

  const getPersistedCollections = async () => {
    const res = await lensClientRef.current?.getPersistedCollections();
    console.log("[getPersistedCollections]res:", res);
  };

  /** snapshot toolkit */
  const createProposal = async () => {
    if(!spaceId) {
      alert("please enter spaceId ...");
      return;
    }
    const proposal: Proposal = {
      space: spaceId,
      type: "single-choice", // define the voting system
      title: "proposal_title",
      body: "proposal_description",
      choices: ["option01", "option02", "option03"],
      discussion: "",
      start: now(),
      end: now() + TEN_MINUTES,
      snapshot: 17561820,
      plugins: JSON.stringify({}),
      app: "my-app-01", // provide the name of your project which is using this snapshot.js integration
    };
    const res = await snapshotClientRef.current!.createProposal(proposal);

    console.log("[createProposal]res:", res);
    setProposalId(res.id);
  }

  const vote = async () => {
    if(!proposalId || !spaceId) {
      alert("create a proposal before vote");
      return;
    }
    const test_vote =
      {
        space: spaceId,
        proposal: proposalId,
        type: 'single-choice',
        choice: 1,
        reason: 'Choice 1 make lot of sense',
        app: 'my-app'
      } as Vote;


    const res = await snapshotClientRef.current!.castVote(test_vote);
    console.log("[vote]res:", res);
  }

  const joinSpace = async () => {
    if(!spaceId) {
      alert("please enter spaceId ...");
      return;
    }

    const spaceObj = {
      space: spaceId as string
    }
    const res = await snapshotClientRef.current!.joinSpace(spaceObj);
    console.log("[joinSpace]res:", res);
  }
  const getActions = async () => {
    if(!spaceId) {
      alert("please enter spaceId ...");
      return;
    }

    const params = {
      space: spaceId,
      first: 20,
      skip: 10,
      orderDirection: OrderDirection.asc
    } as GetActionParams
    const res =  await snapshotClientRef.current!.getActions(params);
    console.log("[getActions]", res)
    setSpaceActions(res);
  }

  const getProposals = async () => {
    const variables = {
      space: spaceId ?? "toolkits.eth",
      first: 20,
      skip: 0,
      state: State.active,
      orderDirection: OrderDirection.asc
    } as GetProposalsParams;
    const res = await snapshotClientRef.current!.getProposals(variables);
    console.log("[queryProposals]", res);
    setProposals(res)
  }

  const queryProposal = async () => {
    const res = await snapshotClientRef.current!.getProposalById(
      proposalId ?? "0x5d790744b950c5d60e025b3076e1a37022f6a5a2ffcf56ba38e2d85192997ede"
    );
    console.log("[queryProposal]", res);
  }

  const querySpaceDetail = async () => {
    const res = await snapshotClientRef.current!.getSpaceDetail(sId ?? spaceId ?? "toolkits.eth");
    console.log("[querySpaceDetail]", res)
  }

  const listVotes = async () => {
    const res = await snapshotClientRef.current!.listVotes();
    console.log("[listVotes]", res)
  }

  const listProposals = async () => {
    const res = await snapshotClientRef.current!.listProposals();
    console.log("[listProposals]", res)
  }

  return (
    <div className="App">
      <button onClick={connect}>connect</button>
      <div className="blackText">{pkh}</div>
      <hr />

      <h2 className="label">Push Channel</h2>
      <button onClick={getUserSubscriptions}>getUserSubscriptions</button>
      <button onClick={getUserSpamNotifications}>
        getUserSpamNotifications
      </button>
      <button onClick={getNotificationsByUser}>getNotificationsByUser</button>
      <button onClick={subscribe}>subscribe</button>
      <button onClick={unsubscribe}>unsubscribe</button>
      <button onClick={sendNotification}>sendNotification</button>
      <button onClick={getChannelDetail}>getChannelDetail</button>
      <button onClick={getSubscriberOfChannel}>getSubscriberOfChannel</button>
      <button onClick={searchChannelByName}>searchChannelByName</button>
      <button onClick={getNotificationList}>getNotificationList</button>
      <br />

      <h2 className="label">Push Chat</h2>
      <button onClick={createPushChatUser}>createPushChatUser</button>
      <button onClick={sendChatMessage}>sendChatMessage</button>
      <button onClick={fetchHistoryChats}>fetchHistoryChats</button>
      <button onClick={getChatMessageList}>getChatMessageList</button>
      <br />

      <h2 className="label">Tableland</h2>
      <button onClick={createTable}>createTable</button>
      <button onClick={insertTable}>insertTable</button>
      <button onClick={updateTable}>updateTable</button>
      <button onClick={getTableByTableId}>getTableByTableId</button>
      <button onClick={getTableList}>getTableList</button>
      <br />

      <h2 className="label">Livepeer</h2>
      {livepeerClientRef.current?.reactClient && (
        <>
          <LivepeerConfig client={livepeerClientRef.current.reactClient!}>
            <LivepeerWidget
              address={address}
              livepeerClient={livepeerClientRef.current}
              setAsset={setAsset}
            />
            {asset?.id && (
              <LivepeerPlayer
                reactClient={livepeerClientRef.current.reactClient}
                playbackId={asset.playbackId}
              />
            )}
          </LivepeerConfig>
        </>
      )}
      <br />

      <h2 className="label">Xmtp</h2>
      <button onClick={isUserOnNetwork}>isUserOnNetowork</button>
      <button onClick={sendMessageToMsgReceiver}>
        sendMessageToMsgReceiver
      </button>
      <button onClick={getMessageWithMsgReceiver}>
        getMessageWithMsgReceiver
      </button>
      <button onClick={getPersistedMessages}>getPersistedMessages</button>
      <br />

      <h2 className="label">Lens</h2>
      <button onClick={createProfile}>createProfile</button>
      <button onClick={getProfiles}>getProfiles</button>
      <input
        type="text"
        value={profileId || ""}
        placeholder="profileId"
        onChange={(event) => setProfileId(event.target.value)}
      />
      <button onClick={post}>post</button>
      <button onClick={postWithSig}>postWithSig</button>
      <button onClick={comment}>comment</button>
      <button onClick={commentWithSig}>commentWithSig</button>
      <button onClick={mirror}>mirror</button>
      <button onClick={mirrorWithSig}>mirrorWithSig</button>
      <button onClick={collect}>collect</button>
      <button onClick={collectWithSig}>collectWithSig</button>
      <button onClick={getPersistedPublications}>getPersistedPublications</button>
      <button onClick={getPersistedCollections}>getPersistedCollections</button>
      <br />

      <h2 className="label">Snapshot</h2>
      <input
        type="text"
        value={spaceId}
        placeholder="spaceId: toolkits.eth"
        onChange={(event) => setSpaceId(event.target.value)}
      />
      <button onClick={createProposal}>createProposal</button>
      <button onClick={getProposals}>getProposals</button>
      {proposals && (
        <div className="json-view">
          <ReactJson src={proposals} collapsed={true} />
        </div>
      )}
      <button onClick={vote}>vote</button>
      <button onClick={joinSpace}>joinSpace</button>
      <button onClick={getActions}>getActions</button>
      {spaceActions && (
        <div className="json-view">
          <ReactJson src={spaceActions} collapsed={true} />
        </div>
      )}
      <input
        type="text"
        value={proposalId}
        placeholder="proposalId"
        onChange={(event) => setProposalId(event.target.value)}
      />
      <button onClick={queryProposal}>queryProposal</button>
      <input
        type="text"
        value={sId}
        placeholder="toolkits.eth"
        onChange={(event) => setSId(event.target.value)}
      />
      <button onClick={querySpaceDetail}>querySpaceDetail</button>
      <button onClick={listVotes}>listVotes</button>
      <button onClick={listProposals}>listProposals</button>
    </div>
  );
}

export default Toolkits;
