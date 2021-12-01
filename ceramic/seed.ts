import { CeramicClient } from '@ceramicnetwork/http-client';
import { ModelManager } from '@glazed/devtools';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import { fromString } from 'uint8arrays';
import { writeFile } from 'node:fs/promises';
// import localModel from './local-model.json';
// import publishedModel from './published-model.json';

// The seed must be provided as an environment variable
async function setupClient(key: string) {
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

// Create a manager for the model
const manager = new ModelManager(ceramic);

// Astronaut schema schema
const astronautSchemaID = await manager.createSchema('Astronaut', {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Astronaut',
    type: 'object',
    properties: {
        name: {
            type: 'string',
            title: 'name',
            maxLength: 100,
            nullable: true,
        },
        missions: {
            type: 'integer',
            title: 'missions',
            maxLength: 100,
            nullable: true,
        },
    },
});

// Astronauts (notice the "s") is a collection of Astronaut Records (called an Instance in ThreadDB or a Row in RDMS)
// kjzl6cwe1jw148pplg129y5de0d9w4e72qd6iut7h52taz4aqxxc6chf2iw58f6
const astronautsSchemaID = await manager.createSchema('Astronauts', {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Astronauts',
    type: 'object',
    properties: {
        astronauts: {
            type: 'array',
            title: 'astronauts',
            nullable: true,
            items: {
                type: 'object',
                title: 'Astronaut',
                properties: {
                    id: {
                        $comment: `cip88:ref:${manager.getSchemaURL(astronautSchemaID)}`,
                        type: 'string',
                        pattern: '^ceramic://.+(\\?version=.+)?',
                        maxLength: 500,
                        nullable: true,
                    },
                    name: {
                        type: 'string',
                        title: 'name',
                        maxLength: 100,
                        nullable: true,
                    },
                },
            },
        },
    },
});

// kjzl6cwe1jw148y4fvhwn6aanbll27uvze17p38yio42ydhyefce4n9ulao1bso;
const astronautDef = await manager.createDefinition('Astronaut', {
    name: 'Astronaut',
    description: 'An Astronaut is a galaxy explorer.',
    schema: manager.getSchemaURL(astronautSchemaID) || '',
});

//kjzl6cwe1jw14bdm48b1n6syjkojvv4vyopq3vyg5qcd0hl5b7oja65smjmllg7
const astronautsDef = await manager.createDefinition('Astronauts', {
    name: 'Astronauts',
    description: 'A stream containing all Astronauts.',
    schema: manager.getSchemaURL(astronautsSchemaID) || '',
});

// const astronautSchemaID = await manager.getSchemaID('Astronaut');
// console.log(astronautSchemaID);

// console.log(astronautDef);

// console.log(astronautsDef);

// Create a Note with text that will be used as placeholder
// kjzl6cwe1jw14acxz0evmuy6c4e429tppne6sa7j7ehnt29ahmfpfyu5zejqkfq
const tileId = await manager.createTile(
    'astronaut',
    { name: 'Byron', missions: 1 },
    {
        schema: manager.getSchemaURL(astronautSchemaID) || '',
    },
);

const astronautsCollectionTileId = await manager.createTile(
    'astronauts',
    { astronauts: [{ id: `ceramic://${tileId}`, name: 'Byron' }] },
    {
        schema: manager.getSchemaURL(astronautsSchemaID) || '',
    },
);

// Write model to JSON file
await writeFile(new URL('local-model.json', import.meta.url), JSON.stringify(await manager.toJSON()));
await writeFile(new URL('published-model.json', import.meta.url), JSON.stringify(await manager.toPublished()));
