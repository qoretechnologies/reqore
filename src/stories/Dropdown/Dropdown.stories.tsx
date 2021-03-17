import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import {
  ReqoreDropdownDivider,
  ReqoreDropdownItem,
} from "../../components/Dropdown/item";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from "../../index";

export default {
  title: "ReQore/Dropdown",
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
        <ReqoreContent style={{ padding: "40px" }}>
          <h4> Basic </h4>
          <ReqoreDropdown label="Please select">
            <ReqoreDropdownItem selected icon="SunCloudyLine">
              Hello
            </ReqoreDropdownItem>
            <ReqoreDropdownItem icon="BatteryChargeFill">
              How are ya
            </ReqoreDropdownItem>
            <ReqoreDropdownItem disabled icon="StopCircleLine">
              i aM diSAblEd
            </ReqoreDropdownItem>
          </ReqoreDropdown>
          <h4> Disabled if empty </h4>
          <ReqoreDropdown label="I have no kids wohoo!"></ReqoreDropdown>
          <h4> With tooltip </h4>
          <ReqoreDropdown
            label="Check me out"
            componentProps={{
              tooltip: "You looking at me???",
              tooltipPlacement: "right",
            }}
          >
            <ReqoreDropdownItem selected icon="SunCloudyLine">
              Hello
            </ReqoreDropdownItem>
            <ReqoreDropdownItem icon="BatteryChargeFill">
              How are ya
            </ReqoreDropdownItem>
            <ReqoreDropdownItem disabled icon="StopCircleLine">
              i aM diSAblEd
            </ReqoreDropdownItem>
          </ReqoreDropdown>
          <h4> Custom component as label </h4>
          <ReqoreDropdown
            component={ReqoreInput}
            handler="focus"
            useTargetWidth
            componentProps={{
              tooltip: "WOAH!",
              width: 500,
              tooltipPlacement: "top",
              placeholder: "Focus me to see some crazy stuff",
            }}
          >
            <ReqoreDropdownItem selected icon="SunCloudyLine">
              Hello
            </ReqoreDropdownItem>
            <ReqoreDropdownDivider />
            <ReqoreDropdownItem icon="BatteryChargeFill">
              How are ya
            </ReqoreDropdownItem>
            <ReqoreDropdownItem disabled icon="StopCircleLine">
              i aM diSAblEd
            </ReqoreDropdownItem>
          </ReqoreDropdown>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
