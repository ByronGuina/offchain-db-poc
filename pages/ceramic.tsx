import { useEffect, useRef } from 'react';
import { useDbProvider } from './_app';

export default function Ceramic() {
    const { ceramic } = useDbProvider();
    const nameRef = useRef(null);
    const missionsRef = useRef(null);

    function onCreateNewAstronaut() {}
    function onDeleteAstronaut(id: string) {}

    const astronauts = [];

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
                                key={astronaut._id}
                                onClick={() => onDeleteAstronaut(astronaut._id)}
                            >
                                {astronaut.name}
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
