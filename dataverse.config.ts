export const config = {
  slug: "push_livepeer_test001", // app id, need to match this regular: `^[a-zA-Z][a-zA-Z0-9_]*$`
  name: "push_livepeer_test001", // app name should NOT contain "-"
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
      isPublicDomain: false, // default
      schemaName: "channel.graphql",
      encryptable: [],
    },
    {
      isPublicDomain: false, // default
      schemaName: "chatmessage.graphql",
      encryptable: ["link", "cid"],
    },
    {
      isPublicDomain: false, // default
      schemaName: "notification.graphql",
      encryptable: [],
    },
    {
      isPublicDomain: false, // default
      schemaName: "chatgpgkey.graphql",
      encryptable: ["pgp_key"],
    },
    {
      isPublicDomain: false, // default
      schemaName: "livepeerasset.graphql",
      encryptable: [
        "asset_id",
        "storage",
        "playback_id",
        "playback_url",
        "download_url",
      ],
    },
  ],
  ceramicUrl: null, // leave null to use dataverse test Ceramic node. Set to {Your Ceramic node Url} for mainnet, should start with "https://".
};
