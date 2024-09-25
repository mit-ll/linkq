// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub } from "@tabler/icons-react";

import { IS_DEMO_MODE } from "utils/demoData";

export function DemoModeModal() {
  const [opened, { close }] = useDisclosure(true);

  
  if(IS_DEMO_MODE) {
    return (
      <Modal opened={opened} onClose={close} withCloseButton={true} title="Demo Mode">
        <p>LinkQ is currently in demo mode and populated with example data. This example shows how ChatGPT4 can interact with the Wikidata API to convert the user's natural language question into a SPARQL query.</p>
        
        <p>To use LinkQ yourself, you should visit <a href="https://github.com/mit-ll/linkq" target="_blank">our repo <IconBrandGithub style={{marginBottom:-7}}/></a>.</p>
  
        <div style={{display:"flex",flexDirection:"row-reverse"}}><Button onClick={close}>Got it</Button></div>
      </Modal>
    )
  }
  
  return null
}