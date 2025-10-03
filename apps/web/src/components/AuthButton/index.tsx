"use client";

import { Button } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (session) {
        await signOut();
      } else {
        await signIn("github");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Button
        size="small"
        type="text"
        className="text-mint-600 transition-colors hover:bg-mint-50 rounded-full"
        style={{
          padding: "4px 8px",
          fontSize: "16px",
          border: "none",
          boxShadow: "none",
          minWidth: "32px",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        disabled
        title="加载中..."
      >
        <span className="animate-pulse">🐙</span>
      </Button>
    );
  }

  return (
    <Button
      size="small"
      type="text"
      disabled={loading}
      onClick={handleAuth}
      className={`transition-all duration-200 rounded-full ${
        session
          ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          : "text-mint-600 hover:text-rose-400 hover:bg-mint-50"
      }`}
      style={{
        padding: "4px 8px",
        fontSize: "16px",
        border: "none",
        boxShadow: "none",
        minWidth: "32px",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={
        loading
          ? "处理中..."
          : session
            ? `点击退出 (${session.user?.name || session.user?.email?.split("@")[0]})`
            : "点击 GitHub 登录"
      }
    >
      {loading ? (
        <span className="animate-pulse">🐙</span>
      ) : session ? (
        "👤"
      ) : (
        "🐙"
      )}
    </Button>
  );
}
