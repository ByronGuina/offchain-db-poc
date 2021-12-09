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
// have the id and don't want to always store it. If we _do_ store the IDs it'll probably
// be on-chain. Should there be a way to search for Ceramic contents using "SQL"-like queries?
// Could be inspired by ORMs like C#'s LINQ or the various PostgreSQL ORMs.
//
// TODO: Figure out how to keep the relationships in sync when changes need to cascade. Can a Tile
// "subscribe" to changes in another Tile?
//

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

/**
 *
 * @param key should be a 32 character string
 */
export async function setupCore(key: string) {
    const coreClient = new Core<typeof publishedModel>({
        ceramic: CERAMIC_URLS.local,
        model: publishedModel,
    });

    // For ceramic client authentication purposes
    coreClient.ceramic.did = await getDid(key);
    return coreClient;
}

export async function getAstronauts(client: EverestCeramicClient) {
    const multiQuery = [
        {
            streamId: 'ceramic://kjzl6cwe1jw145j1fzam5vmficwju587flyhwb56c8xh2p222k0c0oedu306xul',
            paths: ['/astronauts/[0]/id'],
        },
    ];

    const astronauts = await client.ceramic.multiQuery(multiQuery);
    return astronauts;
}

export async function getAstronautsCollectionStream(client: EverestCeramicClient) {
    const something = await client.dataStore.getRecord('As');
    const stream$ = await client.dataModel.loadTile<'astronauts', AstronautsCollection>('astronauts');

    if (!stream$) {
        throw new Error('No astronauts collection stream found');
    }

    return stream$;
}

/**
 * We're using client.tileLoader rather than client.dataModel.loadTile because we are loading
 * data we have not "tracked" via the published model. If we know the data at "publish" time,
 * then we can use the published model to load it using a human-readable name like "astronaut".
 *
 * In this case, our data could be stored _anywhere_ and we only know the streamID, so we can use
 * the tileLoader to load the Tile based on the streamID rather than a known alias.
 */
export async function getAstronautStream(client: EverestCeramicClient, id: string) {
    // This does not let you use alias autocomplete though. If we have the published model
    // we can use it to path to the streamId for the tile. Or if you have the streamId stored
    // elsewhere you can use it here. The response from tileLoader.load is the same as the
    // response from dataModel.loadTile as they both load a Tile stream.
    const stream$ = await client.tileLoader.load<Astronaut>(id);

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

    const content = stream$.content;

    // Tile updates do not merge data. If we want to merge we need to do a deep copy.
    // A "merge" function does exist for DID DataStore records, but it is shallow.
    // If we don't merge then our new data will completely overwrite the previous record.
    // https://developers.ceramic.network/streamtypes/tile-document/api/#content_1
    return await stream$.update({
        ...content,
        ...astronaut,
    });
}

// TODO: How do we delete a Tile? Is this the right approach? You can delete a Record
// from a DID Index, but it only disconnects the Tile from the DID Index, it doesn't
// actually delete the Tile itself.
export async function deleteAstronaut(client: EverestCeramicClient, astronaut: Astronaut) {
    const stream$ = await getAstronautStream(client, '');
}

// Make a new Astronaut Tile with the Astronaut schema.
export async function createAstronaut(client: EverestCeramicClient, astronaut: Astronaut) {
    // this is similar to using dataModel.createTile('Some alias', content) like below. Rather
    // than the alias determining the schema, we are passing the schema explicitly.
    // const newAstronaut$ = await client.tileLoader.create<Astronaut>(
    //     {
    //         id: 'new-astronaut',
    //         missions: 1,
    //         name: 'New Astronaut',
    //     },
    //     { schema: client.dataModel.getSchemaURL('Astronaut') || '',  },
    // );
    const newAstronaut$ = await client.dataModel.createTile('Astronaut', astronaut);

    const collection$ = await getAstronautsCollectionStream(client);
    const collectionContent = collection$.content;

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
