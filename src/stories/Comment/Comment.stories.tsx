import { StoryObj } from '@storybook/react';
import { IReqoreCommentFeedProps } from '../../components/CommentFeed';
import { ReqoreComment, ReqoreCommentFeed } from '../../index';
import { StoryMeta } from '../utils';
import { argManager } from '../utils/args';

const { createArg } = argManager<IReqoreCommentFeedProps>();

const meta = {
  title: 'Other/Comments/Stories',
  component: ReqoreCommentFeed,
  argTypes: {
    ...createArg('gapSize', {
      type: 'string',
    }),
  },
  args: {
    gapSize: '0',
  },
} as StoryMeta<typeof ReqoreCommentFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template = (args) => {
  return (
    <ReqoreCommentFeed {...args}>
      <ReqoreComment title='Test comment' detail='2 hours ago' icon='UserFill'>
        This is a test
      </ReqoreComment>
      <ReqoreComment
        title='Test comment'
        detail='2 hours ago'
        icon='UserFill'
        rounded
        flat
        intent='info'
      >
        root@f075a0285dc4:/usr/src/app# yarn storybook yarn run v1.22.5 $ start-storybook -p 6006
        --no-dll info @storybook/react v6.3.6 info (node:94152) DeprecationWarning: DLL-related CLI
        flags are deprecated, see:
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-dll-flags (Use
        `node --trace-deprecation ...` to show where the warning was created) info = Loading presets
        info = Loading 1 config file in "/usr/src/app/.storybook" info = Loading 9 other files in
        "/usr/src/app/.storybook" info = Adding stories defined in "/usr/src/app/.storybook/main.js"
        info = Using implicit CSS loaders info = Using prebuilt manager info = Using default
        Webpack4 setup (node:94152) DeprecationWarning: Default PostCSS plugins are deprecated. When
        switching to '@storybook/addon-postcss', you will need to add your own plugins, such as
        'postcss-flexbugs-fixes' and 'autoprefixer'. See
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-default-postcss-plugins
        for details. webpack built preview fa5eb92344441c8f8b60 in 13740ms
      </ReqoreComment>
      <ReqoreComment
        title='Test comment'
        detail='2 hours ago'
        intent='danger'
        image='https://lh3.googleusercontent.com/ogw/ADea4I59tV_-XSMTDNNfJuHsP5-6I22aIE7Q8itFr2peUQ=s32-c-mo'
      >
        This is a test of some kind
      </ReqoreComment>
      <ReqoreComment icon='UserFill' rounded flat intent='info' detail='2 hours ago'>
        root@f075a0285dc4:/usr/src/app# yarn storybook yarn run v1.22.5 $ start-storybook -p 6006
        --no-dll info @storybook/react v6.3.6 info (node:94152) DeprecationWarning: DLL-related CLI
        flags are deprecated, see:
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-dll-flags (Use
        `node --trace-deprecation ...` to show where the warning was created) info = Loading presets
        info = Loading 1 config file in "/usr/src/app/.storybook" info = Loading 9 other files in
        "/usr/src/app/.storybook" info = Adding stories defined in "/usr/src/app/.storybook/main.js"
        info = Using implicit CSS loaders info = Using prebuilt manager info = Using default
        Webpack4 setup (node:94152) DeprecationWarning: Default PostCSS plugins are deprecated. When
        switching to '@storybook/addon-postcss', you will need to add your own plugins, such as
        'postcss-flexbugs-fixes' and 'autoprefixer'. See
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-default-postcss-plugins
        for details. webpack built preview fa5eb92344441c8f8b60 in 13740ms
      </ReqoreComment>
      <ReqoreComment
        rounded
        flat
        intent='info'
        title='Awesome comment'
        actions={[
          {
            label: 'Edit',
            icon: 'Edit2Line',
          },
        ]}
      >
        root@f075a0285dc4:/usr/src/app# yarn storybook yarn run v1.22.5 $ start-storybook -p 6006
        --no-dll info @storybook/react v6.3.6 info (node:94152) DeprecationWarning: DLL-related CLI
        flags are deprecated, see:
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-dll-flags (Use
        `node --trace-deprecation ...` to show where the warning was created) info = Loading presets
        info = Loading 1 config file in "/usr/src/app/.storybook" info = Loading 9 other files in
        "/usr/src/app/.storybook" info = Adding stories defined in "/usr/src/app/.storybook/main.js"
        info = Using implicit CSS loaders info = Using prebuilt manager info = Using default
        Webpack4 setup (node:94152) DeprecationWarning: Default PostCSS plugins are deprecated. When
        switching to '@storybook/addon-postcss', you will need to add your own plugins, such as
        'postcss-flexbugs-fixes' and 'autoprefixer'. See
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-default-postcss-plugins
        for details. webpack built preview fa5eb92344441c8f8b60 in 13740ms
      </ReqoreComment>
      <ReqoreComment
        rounded
        flat
        intent='warning'
        actions={[
          {
            label: 'Edit',
            icon: 'Edit2Line',
          },
          {
            icon: 'DeleteBin2Fill',
          },
        ]}
      >
        root@f075a0285dc4:/usr/src/app# yarn storybook yarn run v1.22.5 $ start-storybook -p 6006
        --no-dll info @storybook/react v6.3.6 info (node:94152) DeprecationWarning: DLL-related CLI
        flags are deprecated, see:
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-dll-flags (Use
        `node --trace-deprecation ...` to show where the warning was created) info = Loading presets
        info = Loading 1 config file in "/usr/src/app/.storybook" info = Loading 9 other files in
        "/usr/src/app/.storybook" info = Adding stories defined in "/usr/src/app/.storybook/main.js"
        info = Using implicit CSS loaders info = Using prebuilt manager info = Using default
        Webpack4 setup (node:94152) DeprecationWarning: Default PostCSS plugins are deprecated. When
        switching to '@storybook/addon-postcss', you will need to add your own plugins, such as
        'postcss-flexbugs-fixes' and 'autoprefixer'. See
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-default-postcss-plugins
        for details. webpack built preview fa5eb92344441c8f8b60 in 13740ms
      </ReqoreComment>
    </ReqoreCommentFeed>
  );
};

export const Basic: Story = {
  render: Template,
};
