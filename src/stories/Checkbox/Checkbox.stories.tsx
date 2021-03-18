import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import {
  ReqoreCheckbox,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from "../../index";

export default {
  title: "ReQore/Checkbox",
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
        <ReqoreContent style={{ padding: "20px" }}>
          <h4>Default</h4>
          <ReqoreCheckbox label="Select me maybe?" size="small" />
          <br />
          <ReqoreCheckbox label="Select me maybe?" />
          <br />
          <ReqoreCheckbox label="Select me maybe?" size="big" />
          <h4>Label on left</h4>
          <ReqoreCheckbox
            label="Select me maybe?"
            size="small"
            labelPosition="left"
          />
          <br />
          <ReqoreCheckbox label="Select me maybe?" labelPosition="left" />
          <br />
          <ReqoreCheckbox
            label="Select me maybe?"
            size="big"
            labelPosition="left"
          />
          <h4>As switch</h4>
          <ReqoreCheckbox label="Select me maybe?" size="small" asSwitch />
          <br />
          <ReqoreCheckbox
            label="Select me maybe?"
            asSwitch
            checked
            tooltip={{
              content: "Basic tooltip",
            }}
          />
          <br />
          <ReqoreCheckbox
            label="Select me maybe?"
            size="big"
            asSwitch
            disabled
          />
          <h4>Checked</h4>
          <ReqoreCheckbox label="Select me maybe?" size="small" checked />
          <br />
          <ReqoreCheckbox label="Select me maybe?" checked />
          <br />
          <ReqoreCheckbox label="Select me maybe?" size="big" checked />
          <h4>With tooltip</h4>
          <ReqoreCheckbox
            label="Basic tooltip"
            size="small"
            tooltip={{
              content: "Basic tooltip",
            }}
          />
          <br />
          <ReqoreCheckbox
            label="Placed tooltip"
            tooltip={{
              content: "Placed tooltip",
              placement: "right",
            }}
          />
          <br />
          <ReqoreCheckbox
            label="Advanced tooltip"
            size="big"
            tooltip={{
              content: "Advanced tooltip",
              placement: "bottom-end",
              noArrow: true,
              useTargetWidth: true,
            }}
          />
          <h4>Disabled</h4>
          <ReqoreCheckbox label="Select me maybe?" size="small" disabled />
          <br />
          <ReqoreCheckbox label="Select me maybe?" disabled />
          <br />
          <ReqoreCheckbox label="Select me maybe?" size="big" disabled />
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
