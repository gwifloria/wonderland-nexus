"use client";

import UIProviders from "@/provider/UIProviders";
import { themeConfig } from "@/theme";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
export default function AntDShell({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider hashPriority="low">
      <ConfigProvider theme={themeConfig}>
        <UIProviders>{children}</UIProviders>
      </ConfigProvider>
    </StyleProvider>
  );
}
