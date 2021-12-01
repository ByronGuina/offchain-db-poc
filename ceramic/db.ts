import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import { fromString } from 'uint8arrays';
import publishedModel from './published-model.json';
import { CERAMIC_URLS, Core } from '@self.id/core';
// import { SelfID, WebClient } from '@self.id/web';

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
// TODO: Figure out how to keep the relationships in sync when changes need to cascade.

// TODO:
// Figure out how to type stream/tile responses
export type EverestCeramicClient = Core<typeof publishedModel>;

type Astronaut = {
    name: string;
    missions: number;
};

type AstronautsCollection = {
    astronauts: {
        id: string;
        name: string;
    }[];
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

    await updateAstronaut(coreClient, 'kjzl6cwe1jw1488hcmwexr8y090vvx4pzv923zdhl03aqctcziz836hl6afgnjd', {
        name: 'Alex',
        missions: 102,
    });

    const astronaut = await getAstronautStream(
        coreClient,
        'kjzl6cwe1jw1488hcmwexr8y090vvx4pzv923zdhl03aqctcziz836hl6afgnjd',
    );

    console.log(astronaut.content);

    return coreClient;
}

setupCore('12345678123456781234567812345678');

export async function getAstronautsCollectionStream(client: EverestCeramicClient) {
    const stream$ = await client.dataModel.loadTile('astronauts');

    if (!stream$) {
        throw new Error('No astronauts collection stream found');
    }

    return stream$;
}

export async function getAstronautStream(client: EverestCeramicClient, id: string) {
    // You _have_ to use the alias if using dataModel.loadTile. See the below comment if
    // you don't have the alias but _do_ have the streamId.
    const stream$ = await client.tileLoader.load(id);

    // alternatively, we can use the below function
    // const stream$ = await coreClient.tileLoader.load(publishedModel.tiles.astronaut);
    //
    // This does not let you use alias autocomplete though. If we have the published model
    // we can use it to path to the streamId for the tile. Or if you have the streamId stored
    // elsewhere you can use it here. The response from tileLoader.load is the same as the
    // response from dataModel.loadTile.

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
            { id: `ceramic://${newAstronaut$.id.toString()}`, name: newAstronaut$.content.name },
        ],
    });

    return newAstronaut$;
}
