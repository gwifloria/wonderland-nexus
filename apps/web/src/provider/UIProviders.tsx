"use client";

import { message, Modal } from "antd";
import React, { createContext, useContext } from "react";

/** message context: [api, contextHolder] */
const MessageCtx = createContext<ReturnType<typeof message.useMessage> | null>(
  null,
);
/** modal context: [api, contextHolder] */
const ModalCtx = createContext<ReturnType<typeof Modal.useModal> | null>(null);

export default function UIProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const messagePair = message.useMessage(); // [messageApi, messageHolder]
  const modalPair = Modal.useModal(); // [modalApi, modalHolder]

  return (
    <MessageCtx.Provider value={messagePair}>
      <ModalCtx.Provider value={modalPair}>
        {/* 两个 holder 只在顶层渲染一次 */}
        {messagePair[1]}
        {modalPair[1]}
        {children}
      </ModalCtx.Provider>
    </MessageCtx.Provider>
  );
}

/** 在任意子组件中拿到 antd message api（success/info/warning/error/loading/open/…）*/
export function useMessage() {
  const ctx = useContext(MessageCtx);
  if (!ctx) throw new Error("useMessage must be used within <UIProviders>");
  return ctx[0];
}

/** 在任意子组件中拿到 antd modal api（confirm/info/success/error/warning）*/
export function useModal() {
  const ctx = useContext(ModalCtx);
  if (!ctx) throw new Error("useModal must be used within <UIProviders>");
  return ctx[0];
}
