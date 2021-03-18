import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import ReqoreRadioGroup from "../../components/RadioGroup";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from "../../index";

export default {
  title: "ReQore/RadioGroup",
  args: {
    theme: {
      main: "#222222",
    },
  },
} as Meta;

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  const [selected, setSelected] = useState(null);

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: "20px" }}>
          <h4>Default</h4>
          <ReqoreRadioGroup
            size="small"
            items={[
              {
                label: "Option 1",
                value: "opt1",
              },
              {
                label: "Option 2",
                value: "opt2",
              },
              {
                label: "Option 3",
                value: "opt3",
              },
            ]}
            onSelectClick={(value) => setSelected(value)}
            selected={selected}
          />
          <br />
          <ReqoreRadioGroup
            items={[
              {
                label: "Option 1",
                value: "opt1",
              },
              {
                label: "Option 2",
                value: "opt2",
              },
              {
                label: "Option 3",
                value: "opt3",
              },
            ]}
            onSelectClick={(value) => setSelected(value)}
            selected={selected}
          />
          <br />
          <ReqoreRadioGroup
            size="big"
            items={[
              {
                label: "Option 1",
                value: "opt1",
              },
              {
                label: "Option 2",
                value: "opt2",
              },
              {
                label: "Option 3",
                value: "opt3",
              },
            ]}
            onSelectClick={(value) => setSelected(value)}
            selected={selected}
          />
          <h4>As switch</h4>
          <ReqoreRadioGroup
            asSwitch
            items={[
              {
                label: "Option 1",
                value: "opt1",
              },
              {
                label: "Option 2",
                value: "opt2",
              },
              {
                label: "Option 3",
                value: "opt3",
              },
            ]}
            onSelectClick={(value) => setSelected(value)}
            selected={selected}
          />
          <h4>Disabled</h4>
          <ReqoreRadioGroup
            disabled
            items={[
              {
                label: "Option 1",
                value: "opt1",
              },
              {
                label: "Option 2",
                value: "opt2",
              },
              {
                label: "Option 3",
                value: "opt3",
              },
            ]}
            onSelectClick={(value) => setSelected(value)}
            selected={selected}
          />
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
