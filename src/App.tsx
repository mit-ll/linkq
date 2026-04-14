// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { Chat } from 'components/Chat/Chat';
import { DemoModeModal } from 'components/DemoModeModal';
import { IDTableContainer } from 'components/IDTable/IDTable';
import { LinkQStages } from 'components/LinkQStages/LinkQStages';
import { QueryEditor } from 'components/QueryEditor/QueryEditor'
import { QueryVisualization } from "components/QueryVisualization/QueryVisualization";
import { Results } from 'components/Results/Results';

import { MainChatAPIProvider } from 'hooks/useMainChatAPI';
import { RunQueryProvider } from 'hooks/useRunQuery';
import { useState } from 'react';
import { ResizableBox } from "react-resizable";

import styles from 'App.module.scss'


function App() {
  const [width, setWidth] = useState(500);

  return (
    <MainChatAPIProvider>
      <RunQueryProvider>
        <div id={styles["app"]}>
          <div id={styles["state-diagram-container"]}>
            <LinkQStages/>
          </div>

          <div id={styles["sidebar-content-container"]}>
            <ResizableBox
              width={width}
              height={Infinity}
              axis="x"
              minConstraints={[200, Infinity]}
              maxConstraints={[1000, Infinity]}
              resizeHandles={["e"]}
              onResizeStop={(_, data) => {
                setWidth(data.size.width);
              }}
              handle={
                <span id={styles["sidebar-resizer"]}>
                  <span id={styles["sidebar-icon"]}/>
                </span>
              }
            >
              <Chat/>
            </ResizableBox>

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
      </RunQueryProvider>
    </MainChatAPIProvider>
  )
}

export default App
