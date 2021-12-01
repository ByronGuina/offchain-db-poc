import React from 'react';
import '../styles/global.css';
import { ceramicClient } from '../ceramic/db';
import CeramicClient from '@ceramicnetwork/http-client';

interface DbProvider {
    ceramic: CeramicClient;
}

const dbProvider = React.createContext<DbProvider>({
    ceramic: null,
});

export const useDbProvider = () => React.useContext(dbProvider);

function MyApp({ Component, pageProps }) {
    return (
        <dbProvider.Provider value={{ ceramic: ceramicClient }}>
            <Component {...pageProps} />
        </dbProvider.Provider>
    );
}

export default MyApp;
