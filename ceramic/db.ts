import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import { fromString } from 'uint8arrays';
import publishedModel from './published-model.json';
import { CERAMIC_URLS, Core } from '@self.id/core';

// TODO:
// Astronaut definition
//   name: string
//   missions: [Mission]
// Mission definition (relational data)
//   crew: [Astronaut]
//   date: Date
//   ship: Ship

// TODO: Figure out the best way to "search" for elements in an ORM-y way. We won't always
// have the id and don't want to always store it. Maybe we _do_ have the ID on-chain, actually.
//
// TODO: Figure out how to keep the relationships in sync when changes need to cascade. Can a Tile
// "subscribe" to changes in another Tile?
//
// TODO: Figure out how the different DID DataStore specs are related. We can "set" a Schema or
// Definition, at any time, what does that actually mean/do?
//
// A DID DataStore is an index of Definitions and Records.
//   Each Defintion can point to any schema.
//   Each Record is an Instance of that Definition conforming to that schema.
//   Each DID has an index associated with it, so each DID has a "data store".
//   A DID can be anything. A user, a project, a space, or anything we want.
//   In a basic example, we would probably have a user DID.
//   "Every DID has only one global index and its entries represent the entire
//    catalog of data that belongs to the user."

// How do you seach an index? What if I have multiple defintions and want to
//   associate different data to each defintion? Is this by ID? So a user can have
//   a BasicProfile definition then maybe a video games definition, and each one has
//   a record? Each Record is how the data representing a definition changes over time.

// What is the relationship between a Record and a Tile? Is a Tile just an implementation
// of a Record? Is a Tile just any Document that you can retrieve with TileLoader/TileDocument?
// As long as it has a schema you can get it? A Tile is a DataModel construct and a Record is
// a DataStore construct. How does that work?

// A user can do lots of things
//   Create a project --> Creates a new Tile (this is not associated with the User's account)
//   Change a project <> Create a proposal --> Creates a new Tile (this is not associated with the User's account). Dos a proposal get added to the Project DID?
//   Join a team --> Sets a Record on the User's DID DataStore (this is associated with the user's account)
//   Vote on proposals --> ???

// Should _everything_ be DID based? Should proposals have DIDs? What should just be Tiles with StreamIDs?

// From Docs
// DataModels represent a set of Schemas and potentially related Definitions and/or Tiles used together, for example
//   in the context of an application or service built on top of Ceramic.
// The DID DataStore is an implementation of the Identity Index (IDX) CIP, allowing to associate records to a DID.

// So if we want data associated with an application we don't need to tie it to a DID, so we can use DataModels.
// If we want to tie data to an identity (whether it's a person or something else), then we can use the DID DataStore
// to add Records to a user's definitions in their index.

// TODO:
// Figure out how to type stream/tile responses
export type EverestCeramicClient = Core<typeof publishedModel>;

export type Astronaut = {
    id: string;
    name: string;
    missions: number;
};

type AstronautsCollection = {
    astronauts: Astronaut[];
};

async function getDid(key: string) {
    const seed = fromString(key);
    // Create and authenticate the DID
    const did = new DID({
        provider: new Ed25519Provider(seed),
        resolver: getResolver(),
    });

    await did.authenticate();
    return did;
}

// There's a bug where we can't load one of WebClient's dependencies
// async function setupWebClient(key: string) {
//     // TRYING TO USE WEBCLIENT
//     const webClient = new WebClient<typeof publishedModel>({
//         ceramic: CERAMIC_URLS.local,
//         // model: publishedModel,
//     });
//     webClient.ceramic.did = await getDid(key);
//     const self = new SelfID({ client: webClient });
//     const gotIt = await self.get('Astronaut');
//     console.log(gotIt);

//     return webClient;
// }

export async function setupCore(key: string) {
    const coreClient = new Core<typeof publishedModel>({
        ceramic: CERAMIC_URLS.local,
        model: publishedModel,
    });

    coreClient.ceramic.did = await getDid(key);

    /**
     * QUESTION:
     * What is the data architecture and relationship between schemas, definitions and tiles?
     * It seems like I can update any of those with any data I want since they are all just
     * documents. Is there a certain way I should be creating data? Should I only have records
     * in Tiles? Should I add records to other stuff? How do I enforce a schema?
     *
     * How do I use human-readable names for content when loading _tiles_? It seems like we can do
     * it for definitions and schemas easily enough.
     *
     * What's the difference between tileLoader.load and dataModel.loadTile?
     */

    // await stream$.update({
    //     ...stream$.content,
    //     name: 'Byron',
    //     missions: 19,
    // });

    // await updateAstronaut(coreClient, 'kjzl6cwe1jw1488hcmwexr8y090vvx4pzv923zdhl03aqctcziz836hl6afgnjd', {
    //     name: 'Alex',
    //     missions: 102,
    // });

    // const astronaut = await getAstronautStream(
    //     coreClient,
    //     'kjzl6cwe1jw1488hcmwexr8y090vvx4pzv923zdhl03aqctcziz836hl6afgnjd',
    // );

    return coreClient;
}

// setupCore('12345678123456781234567812345678');
setupCore('12345678123456781234567812345670');

export async function getAstronautsCollectionStream(client: EverestCeramicClient) {
    const stream$ = await client.dataModel.loadTile<'astronauts', AstronautsCollection>('astronauts');

    if (!stream$) {
        throw new Error('No astronauts collection stream found');
    }

    return stream$;
}

export async function getAstronautStream(client: EverestCeramicClient, id: string) {
    // This does not let you use alias autocomplete though. If we have the published model
    // we can use it to path to the streamId for the tile. Or if you have the streamId stored
    // elsewhere you can use it here. The response from tileLoader.load is the same as the
    // response from dataModel.loadTile as they both load a Tile stream.
    const stream$ = await client.tileLoader.load(id);

    // alternatively, we can use the below function
    // You _have_ to use the alias if using dataModel.loadTile. See the below comment if
    // you don't have the alias but _do_ have the streamId.
    // const streaem$ = await client.dataModel.loadTile('astronauts');

    if (!stream$) {
        throw new Error('No astronaut stream found');
    }

    return stream$;
}

export async function updateAstronaut(client: EverestCeramicClient, astronautId: string, astronaut: Astronaut) {
    const stream$ = await getAstronautStream(client, astronautId);

    const content = stream$.content as Astronaut;

    // Ceramic does not merge data. If we want to merge we need to do a deep copy.
    // A "merge" function does exist, but it is shallow. If we don't merge then our
    // new data will completely overwrite the previous record.
    return await stream$.update({
        ...content,
        ...astronaut,
    });
}

export async function deleteAstronaut(client: EverestCeramicClient, astronaut: Astronaut) {
    const stream$ = await getAstronautStream(client, '');
    // client.dataModel.
}

// Make a new Astronaut tile with the Astronaut schema.
export async function createAstronaut(client: EverestCeramicClient, astronaut: Astronaut) {
    const newAstronaut$ = await client.dataModel.createTile('Astronaut', astronaut);

    const collection$ = await getAstronautsCollectionStream(client);
    const collectionContent = collection$.content as AstronautsCollection;

    // Also update the collection of astronauts. We need a better way of cascading operations like
    // in a regular RDMS.
    await collection$.update({
        astronauts: [
            ...collectionContent.astronauts,
            {
                id: `ceramic://${newAstronaut$.id.toString()}`,
                name: newAstronaut$.content.name,
                missions: newAstronaut$.content.missions,
            },
        ],
    });

    return newAstronaut$;
}
