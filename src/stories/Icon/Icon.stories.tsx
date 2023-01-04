import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreIconProps } from '../../components/Icon';
import { ReqoreIcon, ReqorePanel } from '../../index';

export default {
  title: 'Components/Icon',
} as Meta;

export const Icon: Story<IReqoreIconProps> = () => {
  return (
    <>
      <ReqorePanel label='Basic' flat minimal>
        <ReqoreIcon icon='AccountCircleLine' size='12px' margin='both' />
        <ReqoreIcon icon='4KFill' size='14px' margin='both' />
        <ReqoreIcon icon='ArrowLeftCircleFill' intent='success' margin='both' />
        <ReqoreIcon icon='HotelFill' size='18px' margin='both' />
        <ReqoreIcon icon='SignalTowerFill' size='20px' color='#ff0000' margin='both' />
        <ReqoreIcon icon='SignalTowerFill' size='20px' color='#291133' sepia margin='both' />
        <ReqoreIcon icon='SignalTowerFill' size='20px' color='#0c7052' blur={1} margin='both' />
        <ReqoreIcon
          icon='SignalTowerFill'
          size='20px'
          color='#700c57'
          contrast={150}
          margin='both'
        />
        <ReqoreIcon icon='SignalTowerFill' size='20px' color='#d5be0f' grayscale margin='both' />
        <ReqoreIcon icon='SignalTowerFill' size='20px' color='#0f5bd5' invert margin='both' />
        <ReqoreIcon
          icon='SignalTowerFill'
          size='20px'
          color='#ffffff'
          opacity={0.5}
          margin='both'
        />
      </ReqorePanel>
      <br />
      <ReqorePanel label='Image' flat minimal>
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='20px'
          margin='both'
        />
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='40px'
          rounded
          margin='both'
        />
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='30px'
          sepia
          margin='both'
        />
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='40px'
          blur={3}
          margin='both'
        />
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='70px'
          contrast={150}
          margin='both'
        />
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='40px'
          brightness={150}
          margin='both'
        />
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='40px'
          opacity={0.5}
          margin='both'
        />
        <ReqoreIcon
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          size='40px'
          invert
          margin='both'
        />
      </ReqorePanel>
      <br />
      <ReqorePanel label='Margined' flat minimal>
        <ReqoreIcon icon='AccountCircleLine' />
        No Margin
        <div>
          <ReqoreIcon icon='4KFill' margin='right' />
          Right Margin
        </div>
        <div>
          Left Margin
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='20px'
            rounded
            margin='left'
          />
        </div>
        <div>
          Both
          <ReqoreIcon icon='HotelFill' margin='both' />
          Sides
        </div>
      </ReqorePanel>
    </>
  );
};
