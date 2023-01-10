import { Meta, Story } from '@storybook/react/types-6-0';
import {
  IReqoreSpacerProps,
  ReqoreHorizontalSpacer,
  ReqoreVerticalSpacer,
} from '../../components/Spacer';
import { ReqorePanel } from '../../index';

export default {
  title: 'Components/Spacer',
} as Meta;

const Template: Story<IReqoreSpacerProps> = () => {
  return (
    <>
      <ReqorePanel label='Horizontal'>
        This is a horizontal spacer with <ReqoreHorizontalSpacer width={50} /> width of 50px
        <br />
        <br />
        This is a horizontal spacer with <ReqoreHorizontalSpacer width={10} size='normal' /> width
        of 10px and size of normal
        <br />
        <br />
        This is a horizontal spacer with <ReqoreHorizontalSpacer width={50} height={100} /> width of
        50px and height of 100px
        <br />
        <br />
        This is a horizontal spacer with{' '}
        <ReqoreHorizontalSpacer width={50} height={50} size='tiny' intent='info' /> width of 50px
        and height of 50px and size of tiny and intent info
        <br />
        <br />
        This is a horizontal spacer with{' '}
        <ReqoreHorizontalSpacer
          width={50}
          size='huge'
          intent='info'
          effect={{
            gradient: {
              colors: { 0: 'danger:lighten:2', 100: 'danger:darken:2' },
              animate: 'always',
              direction: 'to bottom',
            },
          }}
        />{' '}
        width of 30px and height of auto and size of huge and an effect & animation
      </ReqorePanel>
      <ReqoreVerticalSpacer height={10} />
      <ReqorePanel label='Vertical'>
        This is a vertical spacer with <ReqoreVerticalSpacer height={50} /> height of 50px
        <br />
        <br />
        This is a vertical spacer with <ReqoreVerticalSpacer height={10} size='normal' /> height of
        10px and size of normal
        <br />
        <br />
        This is a vertical spacer with <ReqoreVerticalSpacer height={50} width={100} /> height of
        50px and width of 100px
        <br />
        <br />
        This is a vertical spacer with{' '}
        <ReqoreVerticalSpacer width={50} height={50} size='tiny' intent='info' /> width of 50px and
        height of 50px and size of tiny and intent info
        <br />
        <br />
        This is a vertical spacer with{' '}
        <ReqoreVerticalSpacer
          height={50}
          size='tiny'
          effect={{
            gradient: {
              colors: { 0: 'success:lighten:2', 100: 'success:darken' },
              animate: 'always',
              animationSpeed: 5,
              type: 'radial',
              direction: 'to right',
            },
            glow: {
              color: 'success',
              blur: 20,
            },
          }}
        />{' '}
        height of 50px and width of auto and size of tiny and an effect & animation
      </ReqorePanel>
    </>
  );
};

export const Basic = Template.bind({});
