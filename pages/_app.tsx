import React, { useEffect } from 'react';
import '../styles/global.css';
import { EverestCeramicClient, setupCore } from '../ceramic/db';
import { Core } from '@self.id/core';

interface DbProvider {
    ceramic: EverestCeramicClient | null;
}

const dbProvider = React.createContext<DbProvider>({
    ceramic: null,
});

export const useDbProvider = () => React.useContext(dbProvider);

function MyApp({ Component, pageProps }) {
    const [ceramic, setCeramic] = React.useState<EverestCeramicClient | null>(null);

    useEffect(() => {
        async function setupCeramicClient() {
            const ceramic = await setupCore('12345678123456781234567812345678');
            setCeramic(ceramic);
        }

        setupCeramicClient();
    }, []);

    return (
        <dbProvider.Provider value={{ ceramic: ceramic }}>
            <Component {...pageProps} />
        </dbProvider.Provider>
    );
}

export default MyApp;
