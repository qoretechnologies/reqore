import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreIconProps } from '../../components/Icon';
import { ReqoreIcon } from '../../index';

export default {
  title: 'Components/Icon',
} as Meta;

export const Icon: Story<IReqoreIconProps> = () => {
  return (
    <>
      <ReqoreIcon icon='AccountCircleLine' size='12px' />
      <ReqoreIcon icon='4KFill' size='14px' />
      <ReqoreIcon icon='ArrowLeftCircleFill' intent='success' />
      <ReqoreIcon icon='HotelFill' size='18px' />
      <ReqoreIcon icon='SignalTowerFill' size='20px' color='#ff0000' />
      <h4> Margined </h4>
      <ReqoreIcon icon='AccountCircleLine' />
      No Margin
      <div>
        <ReqoreIcon icon='4KFill' margin='right' />
        Right Margin
      </div>
      <div>
        Left Margin
        <ReqoreIcon icon='ArrowLeftCircleFill' margin='left' />
      </div>
      <div>
        Both
        <ReqoreIcon icon='HotelFill' margin='both' />
        Sides
      </div>
    </>
  );
};
