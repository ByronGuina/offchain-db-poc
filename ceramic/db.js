import { CeramicClient } from '@ceramicnetwork/http-client';
import { ModelManager } from '@glazed/devtools';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import { fromString } from 'uint8arrays';
import modelJson from './model.json';
import { Core, CERAMIC_URLS } from '@self.id/core';
const publishedModel = {
    schemas: {
        Astronaut: 'kjzl6cwe1jw14b5bpq9xse3hl8ci4iesch2uxt9ctc2dp1tept6zjebnheitm3l',
        Astronauts: 'kjzl6cwe1jw14augpnsc8fddrf1oxosl6irdn5load7bao3bpkaakn3w96icdml',
    },
    definitions: {},
    tiles: {},
};
const coreClient = new Core({
    ceramic: CERAMIC_URLS.local,
    model: publishedModel,
});
const astronautSchema = await coreClient.get('Astronaut', 'kjzl6cwe1jw14b0wokxbcldxnsho53xbeuse8jme3ohlr08pwbj8h0y74d906kp');
// console.log(astronautSchema);
// TODO:
// Astronaut definition
//   name: string
//   missions: [Mission]
// Mission definition (relational data)
//   crew: [Astronaut]
//   date: Date
//   ship: Ship
// The seed must be provided as an environment variable
async function setupClient(key) {
    // if (!seed) {
    //     throw new Error('Missing SEED environment variable');
    // }
    const seed = fromString(key);
    // Create and authenticate the DID
    const did = new DID({
        provider: new Ed25519Provider(seed),
        resolver: getResolver(),
    });
    // WHY DO WE NEED TO AUTHENTICATE IT?
    await did.authenticate();
    const ceramic = new CeramicClient('http://localhost:7007');
    ceramic.did = did;
    return ceramic;
}
// Connect to the local Ceramic node// Connect to the local Ceramic node
export const ceramic = await setupClient('12345678123456781234567812345678');
// const banana = {
//     schemas: {
//         kjzl6cwe1jw14b5bpq9xse3hl8ci4iesch2uxt9ctc2dp1tept6zjebnheitm3l: {
//             alias: 'Astronaut',
//             dependencies: {},
//             version: 'k3y52l7qbv1fryn9vayuo9w8t2zcww2x5kpgc0g2j4lsxe4x4njlopxuuzr9ul5hc',
//         },
//         kjzl6cwe1jw14augpnsc8fddrf1oxosl6irdn5load7bao3bpkaakn3w96icdml: {
//             alias: 'Astronauts',
//             dependencies: [Object],
//             version: 'k3y52l7qbv1fryl4muh5izxb5uz01bkbamdep0nu4ppw0bvbn9s976sbpdaag0wlc',
//         },
//     },
//     definitions: {},
//     tiles: {
//         kjzl6cwe1jw14b0wokxbcldxnsho53xbeuse8jme3ohlr08pwbj8h0y74d906kp: {
//             alias: 'astronaut',
//             schema: 'kjzl6cwe1jw14b5bpq9xse3hl8ci4iesch2uxt9ctc2dp1tept6zjebnheitm3l',
//             version: 'k3y52l7qbv1frymegesswpk33d6lnobwx5mxx8rj8a656o1q05u0s92r6n281ar5s',
//         },
//         kjzl6cwe1jw14bhrnay8220nrycu98yyag6s7snp0t5vcjqh77bmnkwe4z0m0iq: {
//             alias: 'Astronaut',
//             schema: 'kjzl6cwe1jw14b5bpq9xse3hl8ci4iesch2uxt9ctc2dp1tept6zjebnheitm3l',
//             version: 'k3y52l7qbv1frypqclpvdamcp2sbb5rsjub48nfshxrdqx8cab82p3omcjd0cjp4w',
//         },
//     },
// };
// Create a manager for the model
// TODO: Wtf is a model manager?
const manager = ModelManager.fromJSON(ceramic, modelJson);
// Create a Note with text that will be used as placeholder
// kjzl6cwe1jw14acxz0evmuy6c4e429tppne6sa7j7ehnt29ahmfpfyu5zejqkfq
// const tileId = await manager.createTile(
//     'placeholderNote',
//     { text: 'This is a placeholder for the note contents...' },
//     { schema: manager.getSchemaURL(noteSchemaID) || '' },
// );
// kjzl6cwe1jw14beulppy23m6k2q3ge2zlchudk4xpzils55ydhji7jw8r1jet7y
// const newAstronautId = await manager.createTile(
//     'Astronaut',
//     { name: 'John', missions: 1 },
//     {
//         schema: manager.getSchemaURL('kjzl6cwe1jw14b5bpq9xse3hl8ci4iesch2uxt9ctc2dp1tept6zjebnheitm3l') || '',
//     },
// );
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
//
// The crux is: What is a spec and what is an actual implementation meant to be used to write applications?
// const doc = await TileDocument.load(ceramic, 'kjzl6cwe1jw14b0wokxbcldxnsho53xbeuse8jme3ohlr08pwbj8h0y74d906kp');
// console.log(doc.id);
// TODO: Use DataModel runtime to be able to use human readable names for schema and stream references
// Write model to JSON file
// await writeFile(new URL('model.json', import.meta.url), JSON.stringify(manager.toJSON()));
// console.log('Encoded model written to scripts/model.json file');
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
