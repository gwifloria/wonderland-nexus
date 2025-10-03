import "antd/dist/reset.css"; // ✅ 必须放在最靠前

import "@ant-design/v5-patch-for-react-19";

import AuthProvider from "@/components/AuthProvider";
import BugFeedbackButton from "@/components/BugFeedbackButton";
import CommitInfo from "@/components/CommitInfo";
import PageHeader from "@/components/PageHeader";
import { MonitoringProvider } from "@/provider/MonitoringProvider";

import { defaultMetadata } from "@/constants/metadata";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Delius } from "next/font/google";
import "./globals.css";

const delius = Delius({ subsets: ["latin"], weight: "400", display: "swap" });
export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html title="floria-wonderland" lang="en">
      <body className={`${delius.className} bg-mint-100`}>
        <AuthProvider>
          <MonitoringProvider>
            <div className="fixed inset-0 -z-10 bg-white/10 overflow-hidden" />
            {/* 柔化遮罩 */}
            <div className="main-background overflow-hidden mx-auto h-dvh p-16 pt-[56px]">
              <PageHeader />

              <div className="h-full overflow-auto">
                {children}
                <SpeedInsights></SpeedInsights>
              </div>
            </div>
            <CommitInfo />
            <BugFeedbackButton />
          </MonitoringProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
