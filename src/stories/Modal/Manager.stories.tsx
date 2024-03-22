import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { noop } from 'lodash';
import { useEffect, useState } from 'react';
import { ReqoreBackdrop } from '../../components/Drawer/backdrop';
import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreModal,
  ReqorePanel,
  useReqoreProperty,
} from '../../index';
import { StoryMeta } from '../utils';

const TIMEOUT = 2000;

const meta = {
  title: 'Utilities/Global Modal/Tests',
  component: ReqoreModal,
  render: ({ data, updateToData, options }) => {
    const addModal = useReqoreProperty('addModal');
    const [modalId, setModalId] = useState<string>(undefined);

    useEffect(() => {
      if (updateToData && modalId) {
        setTimeout(() => {
          addModal(updateToData, modalId);
        }, TIMEOUT);
      }
    }, [modalId]);

    return (
      <ReqoreControlGroup>
        <ReqoreButton
          id='modal'
          onClick={() => {
            setModalId(addModal(data, 'modal', options));
          }}
        >
          Open new modal
        </ReqoreButton>
      </ReqoreControlGroup>
    );
  },
} as StoryMeta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromObject: Story = {
  args: {
    data: {
      label: 'Test modal',
      children: (
        <ReqorePanel collapsible>This is a modal from an object with complex children</ReqorePanel>
      ),
      bottomActions: [
        {
          label: 'Cancel',
          onClick: noop,
          icon: 'CloseLine',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getAllByText('Open new modal')[0]);

    await expect(document.querySelector('.reqore-modal')).toBeTruthy();
  },
};

const ModalWithState = (props) => {
  const [text, setText] = useState('This is a modal with its own state');
  const addModal = useReqoreProperty('addModal');
  const removeModal = useReqoreProperty('removeModal');

  return (
    <ReqoreModal label={props.label} {...props}>
      <ReqoreControlGroup>
        <ReqoreInput
          value={text}
          intent={props.intent}
          onChange={(e: any) => setText(e.target.value)}
        />
        <ReqoreButton
          onClick={() => addModal(<ModalWithState label='Another modal' />)}
          tooltip='Open sesame'
        >
          Open another modal
        </ReqoreButton>
        <ReqoreButton onClick={() => removeModal('modal')}>Remove modal</ReqoreButton>
      </ReqoreControlGroup>
      <ReqoreCollection items={[{ label: 'Item 1' }, { label: 'Item 2' }]} />
    </ReqoreModal>
  );
};

export const FromElement: Story = {
  args: {
    data: (<ModalWithState label='Test modal' />) as any,
  },
  play: async ({ canvasElement, ...rest }) => {
    await FromObject.play({ canvasElement, ...rest });
  },
};

export const FromCustomElement: Story = {
  args: {
    data: (
      <>
        <ReqoreBackdrop />
        <div
          className='custom-modal reqore-modal'
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid red',
            zIndex: 10000,
          }}
        >
          This is a custom modal
        </div>
      </>
    ),
  },
  play: async ({ canvasElement, ...rest }) => {
    await FromObject.play({ canvasElement, ...rest });
  },
};

export const CanBeClosed: Story = {
  ...FromObject,
  play: async ({ canvasElement, ...rest }) => {
    await FromObject.play({ canvasElement, ...rest });
    await fireEvent.click(document.querySelector('.reqore-drawer-close-button'));

    await expect(document.querySelector('.reqore-modal')).toBeNull();
  },
};

export const CanBeClosedManually: Story = {
  ...FromElement,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await FromObject.play({ canvasElement, ...rest });
    await waitFor(async () => await canvas.findAllByText('Remove modal')[0], { timeout: 10000 });

    await fireEvent.click(canvas.getAllByText('Remove modal')[0]);
  },
};

export const CannotBeClosed: Story = {
  args: {
    data: {
      children: 'I cannot be closed',
    },
    options: {
      closable: false,
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    await FromObject.play({ canvasElement, ...rest });
  },
};

export const CanBeUpdated: Story = {
  args: {
    data: (<ModalWithState label='Test modal' />) as any,
    updateToData: (<ModalWithState label='Updated modal' intent='info' />) as any,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await FromElement.play({ canvasElement, ...rest });

    await waitFor(async () => await canvas.findByText('Updated modal'), { timeout: 10000 });

    await expect(canvas.findByText('Updated modal')).toBeTruthy();
  },
};
