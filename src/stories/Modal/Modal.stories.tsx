import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useContext, useState } from 'react';
import ReqoreButton from '../../components/Button';
import ReqoreControlGroup from '../../components/ControlGroup';
import { ReqoreModalActions, ReqoreModalActionsGroup } from '../../components/Modal/actions';
import { ReqoreModalContent } from '../../components/Modal/content';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreContext,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqorePopover,
  ReqoreUIProvider,
} from '../../index';

export default {
  title: 'ReQore/Modal',
  args: {
    theme: {
      main: '#222222',
    },
  },
} as Meta;

const ConfirmButton = () => {
  const reqoreContext = useContext(ReqoreContext);
  const [status, setStatus] = useState(null);

  return (
    <>
      <ReqoreButton
        onClick={() => {
          reqoreContext?.confirmAction({
            title: 'Are you sure mate?',
            description: 'Do you really wanna do this?',
            confirmButtonIntent: 'warning',
            confirmIcon: 'SunFill',
            confirmLabel: 'Yep',
            onConfirm: () => setStatus('Confirmed'),
            onCancel: () => setStatus('Cancelled'),
          });
        }}
      >
        {' '}
        Custom confirm action{' '}
      </ReqoreButton>
      <br />
      <ReqoreButton
        onClick={() => {
          reqoreContext?.confirmAction({
            onConfirm: () => setStatus('Confirmed'),
            onCancel: () => setStatus('Cancelled'),
          });
        }}
      >
        {' '}
        Confirm action{' '}
      </ReqoreButton>
      <br />
      {status && <p>{status}</p>}
    </>
  );
};

const Template: Story<IReqoreUIProviderProps> = (args: IReqoreUIProviderProps) => {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecModalOpen, setIsSecModalOpen] = useState(false);

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          {/*@ts-ignore*/}
          {args.confirmModal ? (
            <ConfirmButton />
          ) : (
            <>
              <ReqorePopover
                component={ReqoreButton}
                componentProps={{
                  onClick: () => setIsFirstModalOpen(true),
                }}
                content='Hello'
                noWrapper
              >
                Open first modal
              </ReqorePopover>
              <ReqoreModal
                onClose={() => setIsFirstModalOpen(false)}
                height='500px'
                icon='VipCrown2Fill'
                title='I am first modal with title'
                width='80vw'
                isOpen={isFirstModalOpen}
              >
                <ReqoreModalContent>
                  <div style={{ height: '600px' }}>
                    <ReqorePopover
                      component={ReqoreButton}
                      componentProps={{
                        onClick: () => setIsSecModalOpen(true),
                      }}
                      content='Hello'
                      noWrapper
                    >
                      Open second modal
                    </ReqorePopover>
                  </div>
                </ReqoreModalContent>
                <ReqoreModalActions>
                  <ReqoreModalActionsGroup>
                    <ReqoreControlGroup>
                      <ReqoreButton>More info</ReqoreButton>
                    </ReqoreControlGroup>
                  </ReqoreModalActionsGroup>
                  <ReqoreModalActionsGroup position='right'>
                    <ReqoreControlGroup>
                      <ReqoreButton>Cancel</ReqoreButton>
                      <ReqoreButton>Submit</ReqoreButton>
                    </ReqoreControlGroup>
                  </ReqoreModalActionsGroup>
                </ReqoreModalActions>
              </ReqoreModal>
              <ReqoreModal onClose={() => setIsSecModalOpen(false)} isOpen={isSecModalOpen} flat>
                <ReqoreModalContent>This is a minimal modal</ReqoreModalContent>
                <ReqoreModalActions>
                  <ReqoreModalActionsGroup position='right'>
                    <ReqoreControlGroup>
                      <ReqoreButton>Cancel</ReqoreButton>
                      <ReqoreButton>Submit</ReqoreButton>
                    </ReqoreControlGroup>
                  </ReqoreModalActionsGroup>
                </ReqoreModalActions>
              </ReqoreModal>
            </>
          )}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
export const WithLightColor = Template.bind({});
WithLightColor.args = {
  theme: {
    main: '#ffffff',
  },
};
export const WithCustomColor = Template.bind({});
WithCustomColor.args = {
  theme: {
    main: '#0d0221',
    text: {
      color: '#2de2e6',
      dim: false,
    },
  },
};

export const ConfirmationModal = Template.bind({});
ConfirmationModal.args = {
  confirmModal: true,
};
