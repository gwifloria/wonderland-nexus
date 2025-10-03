import { Lab, LabCategory, LabType } from "@/types/lab";
import { Button, Form, Input, Select } from "antd";
import { useRef } from "react";
import { categoryLabelEmoji, typeEmoji } from "./constants";

interface LabFormProps {
  initialValues?: Partial<Lab>;
  onSubmit: (values: Partial<Lab>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function LabForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: LabFormProps) {
  const [form] = Form.useForm();
  const formRef = useRef<any>(null);

  return (
    <Form
      ref={formRef}
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item
        name="title"
        label="title"
        rules={[{ required: true, message: "请输入标题" }]}
      >
        <Input placeholder="输入标题" />
      </Form.Item>

      <Form.Item
        name="category"
        label="category"
        rules={[{ required: true, message: "请选择分类" }]}
      >
        <Select placeholder="请选择分类">
          {Object.keys(categoryLabelEmoji).map((cat) => (
            <Select.Option key={cat} value={cat}>
              {categoryLabelEmoji[cat as LabCategory]} {cat}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="type"
        label="type"
        rules={[{ required: true, message: "请选择类型" }]}
      >
        <Select>
          {Object.keys(typeEmoji).map((type) => (
            <Select.Option key={type} value={type}>
              {typeEmoji[type as LabType]} {type}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="content" label="content">
        <Input.TextArea rows={4} placeholder="详细描述..." />
      </Form.Item>

      <Form.Item name="tags" label="tags">
        <Select mode="tags" placeholder="添加标签" />
      </Form.Item>

      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          保存
        </Button>
      </div>
    </Form>
  );
}
