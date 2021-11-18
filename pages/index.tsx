import { useState, useEffect, FormEvent, useRef } from 'react';
import {
    setupClient,
    keyInfo,
    Astronaut,
    findAllAstronauts,
    startListener,
    getThreadId,
    createAstronaut,
    deleteAstronaut,
} from '../textile/db';
import { Update } from '@textile/hub';

export default function Home() {
    const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
    const nameRef = useRef(null);
    const missionsRef = useRef(null);

    useEffect(() => {
        async function getAstronauts() {
            const client = await setupClient(keyInfo);
            const fetchedAstronauts = await findAllAstronauts(client);
            setAstronauts(fetchedAstronauts);
        }

        async function listenToAstronauts() {
            const client = await setupClient(keyInfo);
            const threadId = await getThreadId(client, 'nasa');

            const listenerCallback = (astronaut: Update<Astronaut>) => {
                console.log(astronaut.action);
                setAstronauts((astronauts) => [...astronauts, astronaut.instance]);
            };

            await startListener(client, threadId, listenerCallback);
        }

        getAstronauts();
        listenToAstronauts();
    }, []);

    async function onCreateNewAstronaut(e: FormEvent) {
        e.preventDefault();

        const client = await setupClient(keyInfo);

        const instanceId = await createAstronaut(client, {
            name: nameRef.current.value,
            missions: Number(missionsRef.current.value),
            _id: '',
        });

        nameRef.current.value = '';
        missionsRef.current.value = '';
    }

    async function onDeleteAstronaut(id: string) {
        const client = await setupClient(keyInfo);
        await deleteAstronaut(client, id);
    }

    return (
        <div className='layout space-y-3'>
            <h1 className='text-lg'>ThreadDB data store</h1>
            <div className='space-y-2'>
                <h2 className='font-bold'>Astronauts</h2>
                <ul>
                    {astronauts.length === 0
                        ? 'Loading...'
                        : astronauts.map((astronaut) => (
                              <li
                                  className='cursor-pointer'
                                  key={astronaut._id}
                                  onClick={() => onDeleteAstronaut(astronaut._id)}
                              >
                                  {astronaut.name}
                              </li>
                          ))}
                </ul>
            </div>
            <form onSubmit={onCreateNewAstronaut}>
                <h2 className='text-lg font-bold mt-6'>Create a new astronaut</h2>
                <label htmlFor='name' className='block'>
                    Astronaut name
                </label>
                <input
                    ref={nameRef}
                    id='name'
                    className='w-full border border-gray-900 px-3 py-2 mb-2'
                    placeholder='Cool name'
                />
                <label htmlFor='missions' className='block'>
                    Number of missions
                </label>
                <input
                    ref={missionsRef}
                    id='missions'
                    className='w-full border border-gray-900 px-3 py-2 mb-2'
                    placeholder='1234089724'
                />
                <button className='bg-gray-700 text-gray-200 px-3 py-2'>Submit Astronaut</button>
            </form>
        </div>
    );
}
