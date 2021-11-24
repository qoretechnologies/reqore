import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useContext, useState } from 'react';
import ReqoreButton from '../../components/Button';
import ReqoreControlGroup from '../../components/ControlGroup';
import { IReqoreModalProps } from '../../components/Modal';
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
            intent: 'danger',
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
  const [isFirstModalOpen, setIsFirstModalOpen] = useState<IReqoreModalProps>({});
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
              <ReqoreButton
                onClick={() =>
                  setIsFirstModalOpen({
                    isOpen: true,
                    icon: 'VipCrown2Fill',
                    title: 'I am first modal with title',
                  })
                }
              >
                Open basic modal
              </ReqoreButton>
              <ReqoreButton
                onClick={() =>
                  setIsFirstModalOpen({
                    isOpen: true,
                    icon: 'VipCrown2Fill',
                    title: 'I am first modal with title',
                    hasBackdrop: false,
                  })
                }
              >
                Open modal with no backdrop
              </ReqoreButton>
              <ReqoreModal onClose={() => setIsFirstModalOpen({})} {...isFirstModalOpen}>
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Sit amet purus gravida quis blandit
                    turpis cursus in hac. Ultricies lacus sed turpis tincidunt. Ac tincidunt vitae
                    semper quis lectus nulla at. Aliquam vestibulum morbi blandit cursus risus at
                    ultrices. Risus feugiat in ante metus dictum. Enim blandit volutpat maecenas
                    volutpat. Nulla posuere sollicitudin aliquam ultrices sagittis orci a
                    scelerisque. Mollis nunc sed id semper risus in hendrerit gravida. Sem nulla
                    pharetra diam sit amet nisl suscipit. Congue eu consequat ac felis donec et odio
                    pellentesque diam. Augue mauris augue neque gravida in fermentum et
                    sollicitudin. Nulla pellentesque dignissim enim sit amet venenatis urna. Nunc
                    sed blandit libero volutpat sed. Mi in nulla posuere sollicitudin. Eu consequat
                    ac felis donec et odio pellentesque diam. Viverra nam libero justo laoreet sit
                    amet cursus sit amet. Posuere sollicitudin aliquam ultrices sagittis orci a
                    scelerisque. Et netus et malesuada fames ac. Arcu non odio euismod lacinia at
                    quis risus sed vulputate. Sapien eget mi proin sed libero enim sed. Suspendisse
                    faucibus interdum posuere lorem ipsum. In est ante in nibh mauris cursus. Urna
                    cursus eget nunc scelerisque. Mi eget mauris pharetra et ultrices neque. Turpis
                    nunc eget lorem dolor sed viverra ipsum nunc aliquet. Id aliquet lectus proin
                    nibh. At auctor urna nunc id cursus. Erat pellentesque adipiscing commodo elit
                    at imperdiet. Ipsum dolor sit amet consectetur adipiscing elit. Suspendisse
                    interdum consectetur libero id faucibus nisl. Leo vel orci porta non pulvinar
                    neque laoreet. Ut diam quam nulla porttitor massa. Aliquam sem fringilla ut
                    morbi tincidunt augue interdum velit. Suspendisse ultrices gravida dictum fusce
                    ut placerat orci. Quam nulla porttitor massa id. Leo urna molestie at elementum.
                    Eget egestas purus viverra accumsan in. Vitae justo eget magna fermentum iaculis
                    eu non diam. Eu consequat ac felis donec. Elementum nisi quis eleifend quam
                    adipiscing vitae proin sagittis nisl. Tellus cras adipiscing enim eu. Convallis
                    posuere morbi leo urna molestie at elementum eu facilisis. At risus viverra
                    adipiscing at in. Ac tortor dignissim convallis aenean et tortor at risus.
                    Semper quis lectus nulla at volutpat diam ut venenatis. Viverra tellus in hac
                    habitasse platea. Quis blandit turpis cursus in hac habitasse. Interdum posuere
                    lorem ipsum dolor. Tempus iaculis urna id volutpat lacus laoreet non curabitur
                    gravida. Aliquam ut porttitor leo a diam. Nisl vel pretium lectus quam.
                    Consequat nisl vel pretium lectus quam id leo in vitae. Eget nullam non nisi
                    est. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Est
                    ante in nibh mauris cursus mattis. At tellus at urna condimentum. Aliquam nulla
                    facilisi cras fermentum odio eu feugiat pretium nibh. Praesent elementum
                    facilisis leo vel fringilla. Aliquam sem fringilla ut morbi tincidunt. Egestas
                    sed sed risus pretium quam vulputate dignissim suspendisse in. Tempor id eu nisl
                    nunc. Lobortis feugiat vivamus at augue eget arcu dictum. Gravida neque
                    convallis a cras semper auctor. Senectus et netus et malesuada fames ac turpis
                    egestas. Quisque id diam vel quam elementum pulvinar etiam non quam. Gravida
                    arcu ac tortor dignissim. Enim neque volutpat ac tincidunt vitae. Adipiscing
                    bibendum est ultricies integer quis auctor. Magna eget est lorem ipsum dolor sit
                    amet. Sem viverra aliquet eget sit amet tellus cras adipiscing. Platea dictumst
                    quisque sagittis purus sit amet volutpat. Nunc vel risus commodo viverra
                    maecenas. Sit amet est placerat in egestas erat imperdiet sed euismod. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Sit amet purus gravida quis blandit
                    turpis cursus in hac. Ultricies lacus sed turpis tincidunt. Ac tincidunt vitae
                    semper quis lectus nulla at. Aliquam vestibulum morbi blandit cursus risus at
                    ultrices. Risus feugiat in ante metus dictum. Enim blandit volutpat maecenas
                    volutpat. Nulla posuere sollicitudin aliquam ultrices sagittis orci a
                    scelerisque. Mollis nunc sed id semper risus in hendrerit gravida. Sem nulla
                    pharetra diam sit amet nisl suscipit. Congue eu consequat ac felis donec et odio
                    pellentesque diam. Augue mauris augue neque gravida in fermentum et
                    sollicitudin. Nulla pellentesque dignissim enim sit amet venenatis urna. Nunc
                    sed blandit libero volutpat sed. Mi in nulla posuere sollicitudin. Eu consequat
                    ac felis donec et odio pellentesque diam. Viverra nam libero justo laoreet sit
                    amet cursus sit amet. Posuere sollicitudin aliquam ultrices sagittis orci a
                    scelerisque. Et netus et malesuada fames ac. Arcu non odio euismod lacinia at
                    quis risus sed vulputate. Sapien eget mi proin sed libero enim sed. Suspendisse
                    faucibus interdum posuere lorem ipsum. In est ante in nibh mauris cursus. Urna
                    cursus eget nunc scelerisque. Mi eget mauris pharetra et ultrices neque. Turpis
                    nunc eget lorem dolor sed viverra ipsum nunc aliquet. Id aliquet lectus proin
                    nibh. At auctor urna nunc id cursus. Erat pellentesque adipiscing commodo elit
                    at imperdiet. Ipsum dolor sit amet consectetur adipiscing elit. Suspendisse
                    interdum consectetur libero id faucibus nisl. Leo vel orci porta non pulvinar
                    neque laoreet. Ut diam quam nulla porttitor massa. Aliquam sem fringilla ut
                    morbi tincidunt augue interdum velit. Suspendisse ultrices gravida dictum fusce
                    ut placerat orci. Quam nulla porttitor massa id. Leo urna molestie at elementum.
                    Eget egestas purus viverra accumsan in. Vitae justo eget magna fermentum iaculis
                    eu non diam. Eu consequat ac felis donec. Elementum nisi quis eleifend quam
                    adipiscing vitae proin sagittis nisl. Tellus cras adipiscing enim eu. Convallis
                    posuere morbi leo urna molestie at elementum eu facilisis. At risus viverra
                    adipiscing at in. Ac tortor dignissim convallis aenean et tortor at risus.
                    Semper quis lectus nulla at volutpat diam ut venenatis. Viverra tellus in hac
                    habitasse platea. Quis blandit turpis cursus in hac habitasse. Interdum posuere
                    lorem ipsum dolor. Tempus iaculis urna id volutpat lacus laoreet non curabitur
                    gravida. Aliquam ut porttitor leo a diam. Nisl vel pretium lectus quam.
                    Consequat nisl vel pretium lectus quam id leo in vitae. Eget nullam non nisi
                    est. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Est
                    ante in nibh mauris cursus mattis. At tellus at urna condimentum. Aliquam nulla
                    facilisi cras fermentum odio eu feugiat pretium nibh. Praesent elementum
                    facilisis leo vel fringilla. Aliquam sem fringilla ut morbi tincidunt. Egestas
                    sed sed risus pretium quam vulputate dignissim suspendisse in. Tempor id eu nisl
                    nunc. Lobortis feugiat vivamus at augue eget arcu dictum. Gravida neque
                    convallis a cras semper auctor. Senectus et netus et malesuada fames ac turpis
                    egestas. Quisque id diam vel quam elementum pulvinar etiam non quam. Gravida
                    arcu ac tortor dignissim. Enim neque volutpat ac tincidunt vitae. Adipiscing
                    bibendum est ultricies integer quis auctor. Magna eget est lorem ipsum dolor sit
                    amet. Sem viverra aliquet eget sit amet tellus cras adipiscing. Platea dictumst
                    quisque sagittis purus sit amet volutpat. Nunc vel risus commodo viverra
                    maecenas. Sit amet est placerat in egestas erat imperdiet sed euismod. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Sit amet purus gravida quis blandit
                    turpis cursus in hac. Ultricies lacus sed turpis tincidunt. Ac tincidunt vitae
                    semper quis lectus nulla at. Aliquam vestibulum morbi blandit cursus risus at
                    ultrices. Risus feugiat in ante metus dictum. Enim blandit volutpat maecenas
                    volutpat. Nulla posuere sollicitudin aliquam ultrices sagittis orci a
                    scelerisque. Mollis nunc sed id semper risus in hendrerit gravida. Sem nulla
                    pharetra diam sit amet nisl suscipit. Congue eu consequat ac felis donec et odio
                    pellentesque diam. Augue mauris augue neque gravida in fermentum et
                    sollicitudin. Nulla pellentesque dignissim enim sit amet venenatis urna. Nunc
                    sed blandit libero volutpat sed. Mi in nulla posuere sollicitudin. Eu consequat
                    ac felis donec et odio pellentesque diam. Viverra nam libero justo laoreet sit
                    amet cursus sit amet. Posuere sollicitudin aliquam ultrices sagittis orci a
                    scelerisque. Et netus et malesuada fames ac. Arcu non odio euismod lacinia at
                    quis risus sed vulputate. Sapien eget mi proin sed libero enim sed. Suspendisse
                    faucibus interdum posuere lorem ipsum. In est ante in nibh mauris cursus. Urna
                    cursus eget nunc scelerisque. Mi eget mauris pharetra et ultrices neque. Turpis
                    nunc eget lorem dolor sed viverra ipsum nunc aliquet. Id aliquet lectus proin
                    nibh. At auctor urna nunc id cursus. Erat pellentesque adipiscing commodo elit
                    at imperdiet. Ipsum dolor sit amet consectetur adipiscing elit. Suspendisse
                    interdum consectetur libero id faucibus nisl. Leo vel orci porta non pulvinar
                    neque laoreet. Ut diam quam nulla porttitor massa. Aliquam sem fringilla ut
                    morbi tincidunt augue interdum velit. Suspendisse ultrices gravida dictum fusce
                    ut placerat orci. Quam nulla porttitor massa id. Leo urna molestie at elementum.
                    Eget egestas purus viverra accumsan in. Vitae justo eget magna fermentum iaculis
                    eu non diam. Eu consequat ac felis donec. Elementum nisi quis eleifend quam
                    adipiscing vitae proin sagittis nisl. Tellus cras adipiscing enim eu. Convallis
                    posuere morbi leo urna molestie at elementum eu facilisis. At risus viverra
                    adipiscing at in. Ac tortor dignissim convallis aenean et tortor at risus.
                    Semper quis lectus nulla at volutpat diam ut venenatis. Viverra tellus in hac
                    habitasse platea. Quis blandit turpis cursus in hac habitasse. Interdum posuere
                    lorem ipsum dolor. Tempus iaculis urna id volutpat lacus laoreet non curabitur
                    gravida. Aliquam ut porttitor leo a diam. Nisl vel pretium lectus quam.
                    Consequat nisl vel pretium lectus quam id leo in vitae. Eget nullam non nisi
                    est. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Est
                    ante in nibh mauris cursus mattis. At tellus at urna condimentum. Aliquam nulla
                    facilisi cras fermentum odio eu feugiat pretium nibh. Praesent elementum
                    facilisis leo vel fringilla. Aliquam sem fringilla ut morbi tincidunt. Egestas
                    sed sed risus pretium quam vulputate dignissim suspendisse in. Tempor id eu nisl
                    nunc. Lobortis feugiat vivamus at augue eget arcu dictum. Gravida neque
                    convallis a cras semper auctor. Senectus et netus et malesuada fames ac turpis
                    egestas. Quisque id diam vel quam elementum pulvinar etiam non quam. Gravida
                    arcu ac tortor dignissim. Enim neque volutpat ac tincidunt vitae. Adipiscing
                    bibendum est ultricies integer quis auctor. Magna eget est lorem ipsum dolor sit
                    amet. Sem viverra aliquet eget sit amet tellus cras adipiscing. Platea dictumst
                    quisque sagittis purus sit amet volutpat. Nunc vel risus commodo viverra
                    maecenas. Sit amet est placerat in egestas erat imperdiet sed euismod.
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
              <ReqoreModal
                isOpen={isSecModalOpen}
                onClose={() => setIsSecModalOpen(false)}
                opacity={0.7}
                blur={2.5}
                width='30vw'
                icon='24HoursFill'
                intent='danger'
              >
                <ReqoreModalContent>This is a minimal modal</ReqoreModalContent>
                <ReqoreModalActions>
                  <ReqoreModalActionsGroup position='right'>
                    <ReqoreControlGroup>
                      <ReqoreButton>Cancel</ReqoreButton>
                      <ReqoreButton color='#ffff00'>Submit</ReqoreButton>
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
