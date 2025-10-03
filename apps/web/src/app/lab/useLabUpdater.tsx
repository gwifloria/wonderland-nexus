import { Lab, LabUpdateInput } from "@/types/lab";
import { App, Drawer } from "antd";
import { useState } from "react";
import LabForm from "./LabForm";
import { useLabs } from "./useLabs";

interface UseLabUpdaterProps {
  entry: Lab | null;
}

export function useLabUpdater({ entry }: UseLabUpdaterProps) {
  const { message } = App.useApp();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateLab } = useLabs();

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleSubmit = async (values: Partial<LabUpdateInput>) => {
    if (!entry) return;
    setLoading(true);
    try {
      await updateLab({
        id: entry.id,
        ...values,
      });
      close();
      message.success("更新成功");
    } catch (err) {
      message.error("更新失败");
    } finally {
      setLoading(false);
    }
  };

  const drawer = (
    <Drawer
      title="编辑实验室内容"
      open={visible}
      onClose={close}
      width={480}
      destroyOnHidden
    >
      <LabForm
        initialValues={entry ?? undefined}
        onSubmit={handleSubmit}
        onCancel={close}
        loading={loading}
      />
    </Drawer>
  );

  return { open, close, drawer, visible };
}
