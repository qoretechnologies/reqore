import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreHeadingProps } from '../../components/Header';
import { ReqoreHeading } from '../../index';

export default {
  title: 'Components/Heading',
} as Meta;

export const Heading: Story<IReqoreHeadingProps> = () => {
  return (
    <>
      <ReqoreHeading size={1} effect={{ gradient: { from: '#eb63ce', to: '#6f00ff' } }}>
        This is a heading
      </ReqoreHeading>
    </>
  );
};
