import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { FileUpload } from "./FileUpload";

export default {
  title: "FileUpload",
  argTypes: { onClick: { action: "click" } },
  component: FileUpload,
} as Meta;

export const Default = (props: any) => {
  return <FileUpload label="Upload" onClick={props.onClick} />;
};
