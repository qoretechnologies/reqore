import { Meta, Story } from "@storybook/react/types-6-0";
import React, { useState } from "react";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTextarea,
  ReqoreUIProvider,
} from "../../index";

export default {
  title: "ReQore/TextArea",
  args: {
    theme: {
      main: "#222222",
    },
  },
} as Meta;

const str =
  "✔ Checking your system\n" +
  "✔ Locating Application\n" +
  "✔ Preparing native dependencies\n" +
  "✔ Compiling Main Process Code\n" +
  "✔ Launch Dev Servers\n" +
  "✔ Compiling Preload Scripts\n" +
  "✔ Launching Application\n";

const Template: Story<IReqoreUIProviderProps> = (
  args: IReqoreUIProviderProps
) => {
  const [value, setValue] = useState(str);

  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue("");
  };

  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div
            style={{
              padding: "20px",
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
          >
            <h4>Default</h4>
            <ReqoreTextarea placeholder="Hello" size="small" />
            <br />
            <ReqoreTextarea placeholder="Hello" />
            <br />
            <ReqoreTextarea placeholder="Hello" size="big" />
            <h4>Minimal</h4>
            <ReqoreTextarea placeholder="Hello" minimal size="small" />
            <br />
            <ReqoreTextarea placeholder="Hello" minimal />
            <br />
            <ReqoreTextarea placeholder="Hello" minimal size="big" />
            <h4>Disabled</h4>
            <ReqoreTextarea placeholder="Hello" disabled />
            <h4>Clearable</h4>
            <ReqoreTextarea
              scaleWithContent
              onChange={handleValueChange}
              onClearClick={handleValueClear}
              value={value}
            />
            <h4>Scales with content</h4>
            <ReqoreTextarea
              placeholder="Hello"
              scaleWithContent
              value={str}
              width={500}
            />
            <br />
            <ReqoreTextarea minimal scaleWithContent value={str} width={500} />
            <h4>Fluid</h4>
            <ReqoreTextarea scaleWithContent value={str} fluid />
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
