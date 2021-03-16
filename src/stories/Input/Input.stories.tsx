import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import ReqoreInput from "../../components/Input";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider
} from "../../index";

export default {
  title: "ReQore/Input",
  args: {
    theme: {
      main: "#222222",
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div style={{ padding: "20px" }}>
            <h4>Default</h4>
            <ReqoreInput placeholder="Hello" />
            <h4>Minimal</h4>
            <ReqoreInput placeholder="Hello" tooltip="I am Groot!" minimal />
            <h4>Disabled</h4>
            <ReqoreInput placeholder="Hello" disabled />
            <h4>With Tooltip</h4>
            <ReqoreInput placeholder="Hello" tooltip="I am Groot!" />
          </div>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
export const LightColor = Template.bind({});
LightColor.args = {
  theme: {
    main: "#ffffff",
  },
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: "#0d0221",
    color: "#2de2e6",
  },
};
