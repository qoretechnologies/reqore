import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import ReqoreInput from "../../components/Input";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreUIProvider
} from "../../index";

export default {
  title: "ReQore/ControlGroup",
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
          <div style={{ padding: "20px", width: '100%', height: '100%' }}>
            <h4>Buttons</h4>
            <ReqoreControlGroup size="small">
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup>
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup size="big">
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack size="small">
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack>
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack size="big">
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <h4>Inputs</h4>
            <ReqoreControlGroup size="small">
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreInput placeholder="Minimal" tooltip="I am Groot!" minimal />
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreInput placeholder="Minimal" tooltip="I am Groot!" minimal />
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup size="big">
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreInput placeholder="Minimal" tooltip="I am Groot!" minimal />
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack size="small">
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreInput placeholder="Minimal" tooltip="I am Groot!" minimal />
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreInput placeholder="Minimal" tooltip="I am Groot!" minimal />
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack size="big">
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreInput placeholder="Minimal" tooltip="I am Groot!" minimal />
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
            </ReqoreControlGroup>
            <h4>Combined</h4>
            <ReqoreControlGroup>
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack>
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup stack size="big">
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <h4>Fluid</h4>
            <ReqoreControlGroup fluid>
              <ReqoreButton>Button</ReqoreButton>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup fluid stack minimal>
              <ReqoreButton fixed>Button</ReqoreButton>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" />
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled>Disabled</ReqoreButton>
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
              <ReqoreButton minimal fixed>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
            <ReqoreControlGroup fluid stack>
              <ReqoreButton fixed>Button</ReqoreButton>
              <ReqoreInput placeholder="I am Groot!" tooltip="I am Groot!" fixed />
              <ReqoreButton icon='4KFill'>4K UHD</ReqoreButton>
              <ReqoreButton disabled fixed>Disabled</ReqoreButton>
              <ReqoreInput placeholder="Disabled" tooltip="I am Groot!" disabled />
              <ReqoreButton minimal>Minimal</ReqoreButton>
            </ReqoreControlGroup>
            <br />
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
