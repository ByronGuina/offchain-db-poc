import { Ceramic } from '@ceramicnetwork/core';
import { TileDocument } from '@ceramicnetwork/stream-tile';

import * as IPFS from 'ipfs-core';
import * as dagJose from 'dag-jose';
import { convert } from 'blockcodec-to-ipld-format';
import KeyDidResolver from 'key-did-resolver';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { DID } from 'dids';

const format = convert(dagJose);
console.log(format);

const ipfs = await IPFS.create({
    ipld: { formats: [dagJose.name] },
});

const ceramic = await Ceramic.create(ipfs);

const resolver = { ...KeyDidResolver.getResolver(), ...ThreeIdResolver.getResolver(ceramic) };
const provider = new Ed25519Provider(Uint8Array.from('12345678123456781234567812345678'));
const did = new DID({ resolver, provider });

ceramic.did = did;

// create document example
const tileDocument = await TileDocument.create(ceramic, { test: 123 });
