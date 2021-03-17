import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import usePopover from "../../hooks/usePopover";
import { ReqorePopover, ReqoreUIProvider } from "../../index";

export default {
  title: "ReQore/Popover",
} as Meta;

const HoverButton = () => {
  return (
    <ReqorePopover component="button" content="Hello">
      Hover popover
    </ReqorePopover>
  );
};

const ClickButton = ({ content, placement }: any) => {
  const [refElement, setRefElement] = useState(null);

  usePopover({
    targetElement: refElement,
    content: content || "I am a hover tooltip",
    handler: "click",
    placement,
    closeOnOutsideClick: false,
    noArrow: true,
    useTargetWidth: true,
  });

  return (
    <button type="button" ref={setRefElement}>
      Click popover
    </button>
  );
};

const Template: Story<IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <HoverButton />
      <br />
      <br />
      <ClickButton {...args} />
    </ReqoreUIProvider>
  );
};

export const Default = Template.bind({});
export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: "#d7d7d7",
  },
};

export const CustomContent = Template.bind({});
CustomContent.args = {
  content: (
    <div>
      <h1>Tooltip title</h1> Some kind of awesome tooltip text
    </div>
  ),
};

export const CustomPosition = Template.bind({});
CustomPosition.args = {
  placement: "right",
};

const SimplePopoverElement = ({ type = "hover" }: any) => {
  const [refElement, setRefElement] = useState(null);

  return <p ref={setRefElement}>Hover me for more information</p>;
};
