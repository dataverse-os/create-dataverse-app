export const config = {
  slug: "toolkits_test0019", // app id, need to match this regular: `^[a-zA-Z][a-zA-Z0-9_]*$`
  name: "toolkits_test0019", // app name should NOT contain "-"
  logo: "http://no-logo.com",
  website: "", // you can use localhost:(port) for testing
  defaultFolderName: "Untitled",
  description: "",
  models: [
    {
      isPublicDomain: false, // default
      schemaName: "post.graphql",
      encryptable: ["text", "images", "videos"], // strings within the schema and within the array represent fields that may be encrypted, while fields within the schema but not within the array represent fields that will definitely not be encrypted
    },
    {
      isPublicDomain: true,
      schemaName: "profile.graphql",
    },
    {
      isPublicDomain: false,
      schemaName: "channel.graphql",
      encryptable: [],
    },
    {
      isPublicDomain: false,
      schemaName: "chatmessage.graphql",
      encryptable: ["link", "cid"],
    },
    {
      isPublicDomain: false,
      schemaName: "notification.graphql",
      encryptable: [],
    },
    {
      isPublicDomain: false,
      schemaName: "chatgpgkey.graphql",
      encryptable: ["pgp_key"],
    },
    {
      isPublicDomain: false,
      schemaName: "livepeerasset.graphql",
      encryptable: ["storage", "playback_id"],
    },
    {
      isPublicDomain: false,
      schemaName: "table.graphql",
      encryptable: [],
    },
    {
      isPublicDomain: false,
      schemaName: "xmtpmessage.graphql",
      encryptable: ["content"],
    },
    {
      isPublicDomain: false,
      schemaName: "xmtpkeycache.graphql",
      encryptable: ["keys"],
    },
    {
      isPublicDomain: false,
      schemaName: "lenspublication.graphql",
      encryptable: [],
    },
    {
      isPublicDomain: false,
      schemaName: "lenscollection.graphql",
      encryptable: [],
    },
    {
      isPublicDomain: false, // default
      schemaName: "snapshotproposal.graphql",
      encryptable: [], // strings within the schema and within the array represent fields that may be encrypted, while fields within the schema but not within the array represent fields that will definitely not be encrypted
    },
    {
      isPublicDomain: false, // default
      schemaName: "snapshotvote.graphql",
      encryptable: [], // strings within the schema and within the array represent fields that may be encrypted, while fields within the schema but not within the array represent fields that will definitely not be encrypted
    }
  ],
  ceramicUrl: null, // leave null to use dataverse test Ceramic node. Set to {Your Ceramic node Url} for mainnet, should start with "https://".
};
