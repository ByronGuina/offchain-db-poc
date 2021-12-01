import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import { fromString } from 'uint8arrays';
import publishedModel from './published-model.json';
import { CERAMIC_URLS, Core } from '@self.id/core';
import { SelfID, WebClient } from '@self.id/web';

// TODO:
// Astronaut definition
//   name: string
//   missions: [Mission]
// Mission definition (relational data)
//   crew: [Astronaut]
//   date: Date
//   ship: Ship

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

async function setupWebClient(key: string) {
    // TRYING TO USE WEBCLIENT
    const webClient = new WebClient<typeof publishedModel>({
        ceramic: CERAMIC_URLS.local,
        // model: publishedModel,
    });
    webClient.ceramic.did = await getDid(key);
    const self = new SelfID({ client: webClient });
    const gotIt = await self.get('Astronaut');
    console.log(gotIt);

    return webClient;
}

async function setupCore(key: string) {
    const coreClient = new Core<typeof publishedModel>({
        ceramic: CERAMIC_URLS.local,
        model: publishedModel,
    });

    coreClient.ceramic.did = await getDid(key);

    // const astronaut = await coreClient.ceramic.loadStream('Astronaut');

    // const streamId = await coreClient.get(
    //     'Astronaut',
    //     'kjzl6cwe1jw148m6t8cvui50xh9mqcrfiur0v9cj8irmf25q468d6y2ntwg5wsj',
    // );

    // const streamId = await coreClient.dataStore.set('Astronaut', {
    //     name: 'Byron',
    //     missions: 2,
    // });]

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
     * What's the difference between tileLoader.load and dataModel.loadTile
     */

    // Loads the tile. Can use .update and allows aliases
    // const streamAlias$ = (await coreClient.dataModel.loadTile('astronaut')) || { content: '' };

    // Loads the tile. Can use .update but does not allow alias.
    // const stream$ = await coreClient.tileLoader.load(publishedModel.tiles.astronaut);

    // await stream$.update({
    //     ...stream$.content,
    //     name: 'Byron',
    //     missions: 18,
    // });

    // console.log(streamAlias$.content);
    // console.log(stream$.content);
    return coreClient;
}

setupCore('12345678123456781234567812345678');

// There's lots of ways of loading data. Which one _should_ we be using?
// 1. TileDocument.load – I _think_ this is the only way to _change_ data
// 1b. TileLoader.load (an additional abstraction on top of TileDocument)
// 2. ceramic.loadStream
// 3. manager.ceramic.loadStream
// 4. DataModel.loadTile
// 5. self.id mechanisms
//
// How does a Tile relate to a stream? I _think_ a stream is a Tile that changes over time (a stream of data, duh)
//
// There's also multiple ways of referencing your models. Which one should we be using?
// 1. commitIds (you can store these in a .json file using @glazed/devtools)
// 2. aliases using DataModel
// 3. self.id mechanisms
//
// Are there multiple ways of creating models/schemas?
// From what I can tell, self.id only supports certain models out of the box. I'm not sure how to create a new model
// and have it be usable by @self.id/core.
// See: https://github.com/ceramicstudio/self.id/blob/main/packages/core/scripts/publish-model.mjs for potential example
//
// The crux is: What is a spec and what is an actual implementation meant to be used to write applications?
// const doc = await TileDocument.load(ceramic, 'kjzl6cwe1jw14b0wokxbcldxnsho53xbeuse8jme3ohlr08pwbj8h0y74d906kp');
// console.log(doc.id);

// TODO: Use DataModel runtime to be able to use human readable names for schema and stream references

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// The IDX document simply consist of a map from strings to DocIDs. For public data sets the key
// in this map is the DocID (without the prepended ceramic://) of the definition document, and
// the value is the DocID (with ceramic://) of the record document.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

/**
 * As mentioned previously a definition is a document created by a developer to describe a data set. 
 * It has five properties which as described below.
 * 
 * name - The name of the data set
 * description - A short description that describes the data set in a few sentences
 * schema - A DocID of a schema document that has to be set on the record
 * url - An url where more information about this data set can be found (optional)
 * config - An object with configurations needed for this data set (optional)
   The config object can be used for whatever is prefered by the creator of the data set. For example 
   it might be useful to store additional schemas for the data set, urls where the data can be found, 
   DocIDs of service providers that pin the data, etc.
 */

/**
 * !!!! This kinda works similarly to threaddb where data is scoped to a given identity
 * A record is created for the user when an application requests access to a new data set. Each user gets 
   their own unique record that contains information about their individual data, which they control, in 
   the data set. The record may contain the data directly, or contain pointers to data that exists elsewhere.
 *
 * When creating a record the following steps should be taken:
 *
 * Create a new tile document with family set to the DocID of the definition and controller set to the users DID
 * Update the document by setting the schema to the DocID defined in the definition, and the desired content
 * This enables the record to be looked up by only knowing the DocID of the definition and the DID of the user.
 */
