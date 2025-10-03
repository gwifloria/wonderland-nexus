import { GithubOutlined } from "@ant-design/icons";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import Decoration from "../Decoration";
import { AVATAR_SIZES, DECORATIVE_IMAGES, STYLES } from "./constants";

interface AuthStatusProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
  className?: string;
  compact?: boolean; // 紧凑模式，用于编辑器旁边显示
}

export default function AuthStatus({
  onAuthChange,
  className = "",
  compact = false,
}: AuthStatusProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github");
      onAuthChange?.(true);
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      onAuthChange?.(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 bg-rose-100 rounded-2xl" />
      </div>
    );
  }

  if (session?.user) {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={AVATAR_SIZES.COMPACT}
              height={AVATAR_SIZES.COMPACT}
              className={STYLES.AVATAR_COMPACT}
            />
          )}
          <span className="text-xs text-neutral-600 truncate max-w-[120px]">
            {session.user.name || session.user.email}
          </span>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-xs text-rose-500 hover:text-rose-600 transition-colors ml-1"
            title="退出登录"
          >
            {isLoading ? "..." : "退出"}
          </button>
        </div>
      );
    }

    return (
      <div className={`space-y-3 ${className}`}>
        <div className={`${STYLES.CARD_BASE} p-3 max-w-xs`}>
          <Decoration
            src={DECORATIVE_IMAGES.WASHI_TAPE}
            className="-top-1 right-3 w-[36px] h-[12px] rotate-3 opacity-70"
          />
          <div className="flex items-center gap-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={AVATAR_SIZES.NORMAL}
                height={AVATAR_SIZES.NORMAL}
                className={STYLES.AVATAR_NORMAL}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-handwritten text-rose-700 text-sm font-medium truncate">
                {session.user.name || "GitHub User"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className={STYLES.BUTTON_SECONDARY}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-rose-50/30 to-transparent pointer-events-none" />
          <span className="relative">
            {isLoading ? "退出中..." : "✨ 退出登录"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={`${STYLES.CARD_BASE} p-4 text-center`}>
        <Decoration
          src={DECORATIVE_IMAGES.WASHI_BOW}
          className="-top-3 left-5 w-8 h-8 -rotate-12 opacity-60"
        />
        <p className="text-neutral-600 text-sm mb-3 font-handwritten">
          登录后可以发表评论
        </p>
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className={`${STYLES.BUTTON_PRIMARY} w-full flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            "登录中..."
          ) : (
            <>
              <GithubOutlined />
              GitHub 登录
            </>
          )}
        </button>
      </div>
    </div>
  );
}
