import React, { useEffect } from 'react';
import { EverestCeramicClient, setupCore } from '../ceramic/db';
import '../styles/global.css';

interface DbProvider {
    ceramic: EverestCeramicClient;
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
    const [ceramic, setCeramic] = React.useState<EverestCeramicClient>();

    useEffect(() => {
        async function setupCeramicClient() {
            const ceramic = await setupCore('12345678123456781234567812345678');
            setCeramic(ceramic);
        }

        setupCeramicClient();
    }, []);
    1;

    if (!ceramic) {
        return 'Loading ceramic...';
    }

    return (
        <dbProvider.Provider value={{ ceramic: ceramic }}>
            <Component {...pageProps} />
        </dbProvider.Provider>
    );
}

export default MyApp;
