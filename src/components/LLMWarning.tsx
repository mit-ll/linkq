import { useDisclosure } from '@mantine/hooks';
import { Modal, ActionIcon } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export const LLMWarning = ({
  children,
}:{
  children: React.ReactNode,
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="LLM Hallucination Warning">
        {children}
      </Modal>

      <ActionIcon size="xs" variant="filled" aria-label="LLM Hallucination Warning" color="yellow" onClick={open} style={{float:"right", marginTop: 0}}>
        <IconAlertTriangle/>
      </ActionIcon>
    </>
  );
}