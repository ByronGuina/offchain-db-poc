import { FormEvent, useEffect, useRef, useState } from 'react';
import { Astronaut, createAstronaut, getAstronautsCollectionStream } from '../ceramic/db';
import { useDbProvider } from './_app';

export default function Ceramic() {
    const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
    const { ceramic } = useDbProvider();
    const nameRef = useRef<HTMLInputElement>(null);
    const missionsRef = useRef<HTMLInputElement>(null);

    async function onCreateNewAstronaut(e: FormEvent) {
        e.preventDefault();

        if (ceramic && nameRef.current && missionsRef.current) {
            const newAstronaut = {
                id: '',
                name: nameRef.current.value,
                missions: Number(missionsRef.current.value),
            };

            const createdAstronaut = await createAstronaut(ceramic, newAstronaut);

            setAstronauts((astronauts) => [...astronauts, { ...newAstronaut, id: createdAstronaut.id.toString() }]);

            nameRef.current.value = '';
            missionsRef.current.value = '';
        }
    }
    function onDeleteAstronaut(id: string) {}

    useEffect(() => {
        async function init() {
            if (ceramic) {
                const fetchedAstronauts = await getAstronautsCollectionStream(ceramic);
                setAstronauts(fetchedAstronauts.content.astronauts);
            }
        }

        init();
    }, [ceramic]);

    return (
        <div className='layout'>
            <h1 className='text-lg'>Ceramic data store</h1>
            <div className='space-y-2'>
                <h2 className='font-bold'>Astronauts</h2>
                <ul>
                    {astronauts.length === 0 ? (
                        <li>Loading...</li>
                    ) : (
                        astronauts.map((astronaut) => (
                            <li
                                className='cursor-pointer'
                                key={astronaut.id}
                                onClick={() => onDeleteAstronaut(astronaut.id)}
                            >
                                <p>
                                    {astronaut.name} | {astronaut.missions}
                                </p>
                                {astronaut.id}
                            </li>
                        ))
                    )}
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
