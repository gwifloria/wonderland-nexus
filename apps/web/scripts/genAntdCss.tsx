import fs from "fs";
import React from "react";
import { extractStyle } from "@ant-design/static-style-extract";
import { ConfigProvider } from "antd";
import { themeConfig } from "./theme";

const outputPath = "./public/antd.min.css";

const css = extractStyle((node) => (
  <>
    <ConfigProvider
      theme={{
        token: { ...themeConfig },
      }}
    >
      {node}
    </ConfigProvider>
  </>
));

fs.writeFileSync(outputPath, css);
