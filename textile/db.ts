import { Client, PrivateKey, createAPISig, KeyInfo, UserAuth, ThreadID, Update } from '@textile/hub';

// KeyInfo
export const keyInfo: KeyInfo = {
    key: 'bgn4kleqbru6nfemsjha4hllfg4',
    // token: eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJpYXQiOjE2MzcxNzY2ODYsImlzcyI6ImJiYWFyZWlnd2pvYXd1ZWc1a3ZobWMzNjI3Z3Zja2htZTd6emZlbnVqYXVqcHRodGd6Y21odHRvYTZ1Iiwic3ViIjoiYmJhYXJlaWczcG5sc2F5dzNyZmd3cmQ1M3NrbTc0NzdrZmtxZmg2b2F4Y21yd2Vmenh6cGJqbHY0bmEifQ.UNSiJDj1dJzoqWVUE8vmuO-wlsup3t0zQlKkV891lB5BUKHHhLiReGromPM6qfos3VtQDxM0as324Zoy9fQzDw
    // secret: 'bzo7c3pnbxqs56xx4zrgnbeucyqdmiiqaamhwemi',
};

// const auth: UserAuth = {
//     ...keyInfo,
//     // ...createAPISig('bzo7c3pnbxqs56xx4zrgnbeucyqdmiiqaamhwemi').then((result) => result),
// };

export type Astronaut = {
    name: string;
    missions: number;
    _id: string;
};

// Since we are using unsigned keys we don't need to pass a secret and set a signature
export async function setupClient(auth: KeyInfo) {
    const client = await Client.withKeyInfo(auth);
    const token = await client.getToken(
        PrivateKey.fromString('bbaareieq5pk4mua5mb447k5ft3gy4qsdjzx5y6wwiwik4kp6gdsitrfmzu'),
    );

    return client;
}

async function createTable(client: Client) {
    // Create a new DB with the name NASA and no id. If we don't pass an ID it gets autogenerated.
    const threadId = await client.newDB(undefined, 'nasa');

    // This will be an instance of "astronauts" collection in the "nasa" thread
    const lightyear = {
        name: 'Lightyear',
        missions: 5,
        _id: '',
    };

    const buzz = {
        name: 'Buzz',
        missions: 5,
        _id: '',
    };

    // Create a new collection from an object. We name it "astronauts" and generate the schema
    // from the buzz object
    await client.newCollectionFromObject(threadId, buzz, { name: 'astronauts' });

    // Store the buzz object in the new collection as an instance (row)
    const instanceIds = await client.create(threadId, 'astronauts', [buzz, lightyear]);
    console.log(instanceIds);

    return {
        threadId,
        instanceIds,
    };
}

export async function createAstronaut(client: Client, astronaut: Astronaut) {
    const [newAstronautId] = await client.create(await getThreadId(client, 'nasa'), 'astronauts', [astronaut]);
    return newAstronautId;
}

export async function findAstronaut(client: Client, astronautId: string) {
    const threadId = await getThreadId(client, 'nasa');
    return await client.findByID<Astronaut>(threadId, 'astronauts', astronautId);
}

export async function deleteAstronaut(client: Client, astronautId: string) {
    const threadId = await getThreadId(client, 'nasa');
    await client.delete(threadId, 'astronauts', [astronautId]);
    return astronautId;
}

export async function findAllAstronauts(client: Client) {
    const threadId = await getThreadId(client, 'nasa');
    return await client.find<Astronaut>(threadId, 'astronauts', {});
}

async function listCollections(client: Client) {
    const threadId = await getThreadId(client, 'nasa');
    return await client.listCollections(threadId);
}

export async function getThreadId(client: Client, threadName: string | 'nasa') {
    const thread = await client.getThread(threadName);
    return ThreadID.fromString(thread.id);
}

export async function startListener(
    client: Client,
    threadID: ThreadID,
    callback: (astronaut: Update<Astronaut>) => void,
) {
    const filters = [{ actionTypes: ['CREATE', 'DELETE'] }];
    return client.listen<Astronaut>(threadID, filters, callback);
}

// const { threadId } = await createTable(client);
// const astronautId = await createAstronaut(client, {
//     name: 'Carl',
//     missions: 5000,
//     _id: '',
// });

// console.log(await findAllAstronauts(client));
