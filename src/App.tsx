// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { ApiKeyWarning } from 'components/ApiKeyWarning';
import { Chat } from 'components/Chat/Chat';
import { DemoModeModal } from 'components/DemoModeModal';
import { IDTableContainer } from 'components/IDTable/IDTable';
import { QueryEditor } from 'components/QueryEditor/QueryEditor'
import { QueryVisualization } from "components/QueryVisualization/QueryVisualization";
import { Results } from 'components/Results/Results';

import { MainChatAPIProvider } from 'hooks/useMainChatAPI';
import { RunQueryProvider } from 'hooks/useRunQuery';

import styles from 'App.module.scss'
import { LinkQStateDiagramStatus } from 'components/LinkQStateDiagramStatus/LinkQStateDiagramStatus';


function App() {
  return (
    <MainChatAPIProvider>
      <RunQueryProvider>
        <div id={styles["app"]}>
          <div id={styles["state-diagram-container"]}>
            <LinkQStateDiagramStatus/>
          </div>

          <div id={styles["sidebar-content-container"]}>
            <div id={styles["sidebar"]}>
              <Chat/>
            </div>
            
            <div id={styles["content"]}>
              <QueryEditor/>

              <IDTableContainer/>

              <QueryVisualization/>

              <div id={styles["results-content"]}>
                <Results/>
              </div>
            </div>
          </div>
        </div>

        <DemoModeModal/>
        <ApiKeyWarning/>
      </RunQueryProvider>
    </MainChatAPIProvider>
  )
}

export default App
