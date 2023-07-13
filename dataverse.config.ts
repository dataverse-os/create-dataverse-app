export const config = {
  name: "dapp_table_client_test_updated", // app name should NOT contain "-"
  logo: "http://no-logo.com",
  website: [], // you can use localhost:(port) for testing
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
      encryptable: [],
    },
  ],
  ceramicUrl: null, // leave null to use dataverse test Ceramic node. Set to {Your Ceramic node Url} for mainnet, should start with "https://".
};
