import React, { useEffect } from 'react';
import { Client } from '@textile/hub';
import { EverestCeramicClient, setupCore } from '../ceramic/db';
import '../styles/global.css';
import { keyInfo, setupClient } from '../textile/db';

interface DbProvider {
    ceramic: EverestCeramicClient;
    threadDb: Client;
}

const dbProvider = React.createContext<DbProvider | undefined>(undefined);

export const useDbProvider = () => {
    const context = React.useContext(dbProvider);

    if (context === undefined) {
        throw new Error('useDbProvider must be used within a DbProvider');
    }

    return context;
};

function MyApp({ Component, pageProps }) {
    const [value, setDbProvider] = React.useState<DbProvider>();

    useEffect(() => {
        async function setupDbProvider() {
            const ceramic = await setupCore('12345678123456781234567812345678');
            const threadDb = await setupClient(keyInfo);
            setDbProvider({ ceramic, threadDb });
        }

        setupDbProvider();
    }, []);

    if (!value?.ceramic || !value?.threadDb) {
        return <div className='layout'>Loading databases...</div>;
    }

    return (
        <dbProvider.Provider value={value}>
            <Component {...pageProps} />
        </dbProvider.Provider>
    );
}

export default MyApp;
