import { useDisclosure } from '@mantine/hooks';
import { Modal, ActionIcon } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';

export const InfoModal = ({
  children,
  title,
}:{
  children: React.ReactNode,
  title: string,
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title={title}>
        {children}
      </Modal>

      <ActionIcon size="xs" variant="filled" aria-label={title} color="gray" onClick={open} style={{
        marginLeft: "0.5em",
        transform: "translateY(0.1em)",
      }}>
        <IconQuestionMark/>
      </ActionIcon>
    </>
  );
}