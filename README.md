## Running the decentralized database POC

-   npm/yarn/pnpm install
-   Setup ThreadDB and Ceramic
-   npm/yarn/pnpm run dev

### ThreadDB

There shouldn't be any setup as the configuration is hardcoded into `textile/db.ts`. It currently uses [Textile's centralized Hub service](https://docs.textile.io/hub/).

### Ceramic

**Run a Ceramic node locally**

[Ceramic CLI docs](https://developers.ceramic.network/build/cli/installation/#1-install-the-cli)

```bash
npm install -g @ceramicnetwork/cli
ceramic daemon
```

**Ceramic Networks**

Right now th POC is using the local network that you set up when you ran `ceramic daemon`. You can change the network by going into `ceramic/db.ts` and changing the Core client creation to point to another network with CERAMIC_URLS['your network']. You should be able to step into the types to see which networks they support and how to pass the data to the Core client.

**Appendix**

-   [TileDocument API](https://developers.ceramic.network/streamtypes/tile-document/api/#tiledocument-api)
-   [Ceramic CLI docs](https://developers.ceramic.network/build/cli/installation/#1-install-the-cli)
