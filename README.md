## Running the decentralized database POC

-   npm/yarn/pnpm install
-   Setup ThreadDB and Ceramic
-   npm/yarn/pnpm run dev

### ThreadDB

There shouldn't be any setup as the configuration is hardcoded into `textile/db.ts`. It currently uses Textile's centralized Hub service. [LINK TO HUB]

### Ceramic

-   Setup the Ceramic daemon to use the local development network. [INSTALLATION INSTRUCTIONS]
-   You can change the network by going into `ceramic/db.ts` and changing the Core client creation to point to another network with CERAMIC_URLS['your network']. You should be able to step into the types to see which networks they support.
