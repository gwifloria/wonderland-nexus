import { useConfetti } from "@/hooks/useConfetti";
import { useModal } from "@/provider/UIProviders";
import type { Lab, LabStatus } from "@/types/lab";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { cardVariants, statusColor, typeEmoji, typeStyle } from "./constants";

const isProd = process.env.NODE_ENV === "production";

interface LabCardProps extends Lab {
  onDelete?: () => void;
  onStatusChange: (status: LabStatus) => void;
  onEdit?: () => void;
}

export default function LabCard({
  id,
  title,
  type,
  status,
  tags,
  content,
  createdAt,
  onDelete,
  onStatusChange,
  onEdit,
}: any) {
  const modal = useModal();
  const { show, confettiContext } = useConfetti();

  const handleComplete = () => {
    onStatusChange("resolved");
    show();
  };

  const handleDelete = () => {
    modal.confirm({
      title: "Are you sure you want to delete?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: () => onDelete(id),
    });
  };

  return (
    <motion.div
      key={id}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl p-5 border border-gray-100 transition-all duration-200 hover:border-mint-300 relative"
      variants={cardVariants}
      whileHover={{ y: -2 }}
    >
      {confettiContext}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${typeStyle[type as keyof typeof typeStyle]}`}
          >
            {typeEmoji[type as keyof typeof typeEmoji]}
          </span>
          <span className="text-lg font-semibold text-gray-800 group-hover:text-mint-600 transition-colors">
            {title}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded font-medium ${statusColor[status as keyof typeof statusColor]}`}
        >
          {status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-3">
        {content}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
        <span className="bg-gray-50 px-2 py-1 rounded">📅 {createdAt}</span>
        {tags?.map((tag: string) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-50 rounded hover:bg-mint-50 hover:text-mint-600 cursor-pointer transition"
          >
            #{tag}
          </span>
        ))}
      </div>
      {!isProd && (
        <div className="flex justify-between">
          <div className="flex gap-2 text-sm mt-2">
            {status === "open" && (
              <button
                className="px-2 py-1 rounded text-mint-500 hover:bg-mint-100 flex items-center gap-1 border border-transparent transition"
                title="starting"
                onClick={() => onStatusChange("inProgress")}
              >
                <PlayCircleOutlined /> Start
              </button>
            )}
            {status === "inProgress" && (
              <button
                className="px-2 py-1 rounded text-mint-500 hover:bg-mint-100 flex items-center gap-1 border border-transparent transition"
                title="starting"
                onClick={() => onStatusChange("open")}
              >
                <PauseCircleOutlined /> Pause
              </button>
            )}
            {status !== "resolved" && (
              <button
                className="px-2 py-1 rounded hover:bg-nepal-100 text-nepal-300 gap-1 border border-transparent transition"
                title="标记为已完成"
                onClick={handleComplete}
              >
                <CheckOutlined /> Complete
              </button>
            )}
          </div>
          <div className="flex justify-between">
            <button
              className="mr-2 px-2 rounded hover:bg-mint-100 text-mint-600 gap-1 border border-transparent hover:border-mint-300 transition"
              title="编辑"
              onClick={onEdit}
            >
              <EditOutlined />
            </button>
            <button
              className="px-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition
          opacity-50 hover:opacity-100 "
              style={{ fontSize: 16 }}
              title="删除"
              onClick={handleDelete}
            >
              <DeleteOutlined />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
