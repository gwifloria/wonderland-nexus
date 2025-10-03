"use client";
import PageIntro from "@/components/PageIntro";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  cardVariants,
  categoryLabelEmoji,
  containerVariants,
  tabVariants,
} from "./constants";
import LabCard from "./LabCard";
import LabTechDetails from "./LabTechDetails";
import { useLabInitializer } from "./useLabInitializer";
import { useLabUpdater } from "./useLabUpdater";

import AntDShell from "@/provider/AntDShell";
import { SWRShell } from "@/provider/SWRShell";
import { Lab, LabCategory, LabStatus } from "@/types/lab";
import { useLabs } from "./useLabs";

const LabPageContainer = () => {
  const [activeCategory, setActiveCategory] = useState<LabCategory>("tech");
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Lab | null>(null);
  const {
    labs: entries,
    loading: isLoading,
    error,
    updateLab,
    deleteLab,
  } = useLabs();

  const labInit = useLabInitializer({ defaultCategory: activeCategory });

  const labUpdater = useLabUpdater({ entry: editingEntry });

  const filteredEntries = useMemo(() => {
    return (
      entries?.filter(
        (entry) =>
          entry.category === activeCategory &&
          (!showOnlyPending || entry.status !== "resolved"),
      ) || []
    );
  }, [activeCategory, entries, showOnlyPending]);

  const handleDelete = async (id: any) => {
    try {
      await deleteLab({ id });
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: LabStatus) => {
    try {
      await updateLab({ id, status: newStatus });
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const handleEdit = (entry: Lab) => {
    setEditingEntry(entry);
    labUpdater.open();
  };

  return (
    <div className="lab-page-container">
      <motion.main
        className="max-w-4xl mx-auto px-4 py-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        {/* 右侧悬浮 slogan */}
        <motion.div
          className="fixed right-6 top-1/3 max-w-[200px] text-sm text-gray-500 italic leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 1 }}
          style={{ pointerEvents: "none" }} // 不影响点击操作
        >
          <p>
            生活的意义是体验无限可能，
            <br />
            上班是体验生活的一种途径
          </p>
        </motion.div>
        {/* 右侧悬浮 slogan */}
        <motion.div
          className="fixed left-6 top-2/3 max-w-[200px] text-sm text-gray-500 italic leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 1 }}
          style={{ pointerEvents: "none" }} // 不影响点击操作
        >
          <p>
            重要的是过程
            <br />
            而非结果
          </p>
        </motion.div>
        <motion.div
          className="flex items-center gap-3 mb-8"
          variants={tabVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-mint-600 to-mint-400 bg-clip-text text-transparent">
            🧪实验室
          </h1>
          <PageIntro>
            <LabTechDetails />
          </PageIntro>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-between items-center gap-4 mb-8"
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-4">
            {(Object.keys(categoryLabelEmoji) as LabCategory[])
              .filter((category) => category !== "life")
              .map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-mint-500 text-white shadow-lg shadow-mint-500/30"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {categoryLabelEmoji[category]} {category.toUpperCase()}
                </motion.button>
              ))}
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={labInit.open}
            >
              New
            </Button>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyPending}
                onChange={(e) => setShowOnlyPending(e.target.checked)}
                className="w-4 h-4 accent-yellow-500"
              />
              👀 仅看未完成
            </label>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading && !entries.length && (
            <div className="inset-0 z-10 flex items-center bg-white bg-opacity-70 align-center z-50 absolute justify-center py-12">
              <Spin size="large" />
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              加载失败：{error}
            </div>
          )}
          {!isLoading && !error && filteredEntries.length === 0 && (
            <motion.div
              className="text-center py-12 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              暂无符合条件的记录 🤔
            </motion.div>
          )}
          {filteredEntries.length > 0 &&
            filteredEntries.map((entry) => (
              <LabCard
                {...entry}
                id={entry.id}
                key={entry.id}
                onEdit={() => handleEdit(entry)}
                onDelete={() => handleDelete(entry.id)}
                onStatusChange={(status: LabStatus) =>
                  handleStatusChange(entry.id, status)
                }
              />
            ))}
        </motion.div>

        {/* 新建弹窗 */}
        {labInit.modal}
        {/* 编辑抽屉 */}
        {labUpdater.drawer}
      </motion.main>{" "}
    </div>
  );
};
export default function LabPage() {
  return (
    <AntDShell>
      <SWRShell>
        <LabPageContainer></LabPageContainer>
      </SWRShell>
    </AntDShell>
  );
}
