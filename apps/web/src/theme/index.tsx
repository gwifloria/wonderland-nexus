"use client";

import { ThemeConfig } from "antd";

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#89b7a3ff", // 马卡龙薄荷绿
    colorInfo: "#b7c7e6", // 马卡龙淡蓝紫
    colorWarning: "#ffe5b4", // 马卡龙淡杏黄
    colorError: "#f7b7b7", // 马卡龙淡粉红
    colorSuccess: "#c7e5b7", // 马卡龙淡青绿
    colorBgBase: "#f8fafc", // 柔和浅灰白
    colorBgElevated: "#fffaf3", // 浅米白
    colorTextBase: "#6b6b6b", // 柔和深灰
    colorBgContainer: "#fffaf3",
    // AliasToken 补充
    colorFillContent: "#f8fafc", // 内容区背景色
    colorFillContentHover: "#f3f8ff", // 内容区hover色
    colorFillAlter: "#fffaf3", // 替代背景色
    colorBgContainerDisabled: "#f0f0f0", // 禁用态背景色
    colorBgTextHover: "#ffe5b4", // 文本hover背景色
    colorBgTextActive: "#b7d8c5", // 文本激活背景色
    colorBorderBg: "#e6e6e6", // 背景边框色
    colorSplit: "#f0f0f0", // 分割线色
    colorTextPlaceholder: "#bdbdbd", // 占位文本色
    colorTextDisabled: "#bdbdbd", // 禁用文本色
    colorTextHeading: "#6b6b6b", // 标题色
    colorTextLabel: "#a3a3a3", // 标签色
    colorTextDescription: "#bdbdbd", // 描述色
    colorTextLightSolid: "#fff", // 固定文本高亮色
    colorIcon: "#b7d8c5", // 弱操作图标色
    colorIconHover: "#f7b7b7", // 弱操作图标hover色
    colorHighlight: "#ffe5b4", // 高亮色
    controlOutline: "#aec3b7ff", // 输入组件outline色
    colorWarningOutline: "#ffe5b4", // 警告outline色
    colorErrorOutline: "#f7b7b7", // 错误outline色
    controlItemBgHover: "#f3f8dfff", // 控件hover背景色
    controlItemBgActive: "#acceb3ff", // 控件激活背景色
    controlItemBgActiveHover: "#e5f2ccff", // 控件激活hover背景色
  },
  hashed: false,
  cssVar: true,
};
