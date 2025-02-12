// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { Results } from 'components/Results/Results';

import { MainChatAPIProvider } from 'hooks/useMainChatAPI';
import { RunQueryProvider } from 'hooks/useRunQuery';

function App() {
    return (
        <MainChatAPIProvider>
            <RunQueryProvider>
                <Results></Results>

            </RunQueryProvider>
        </MainChatAPIProvider>
    )
}

export default App
