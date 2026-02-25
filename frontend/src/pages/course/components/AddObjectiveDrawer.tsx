import { Drawer, Form, Input, Button, message, Space } from "antd";
import { courseApi } from "../../../api/courseApi";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onSuccess: () => void;
}

const AddObjectiveDrawer = ({ open, onClose, courseId, onSuccess }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await courseApi.createObjective(courseId, values);

      message.success("Objective created successfully");
      form.resetFields();
      onClose();
      onSuccess();
    } catch (err) {
      message.error("Failed to create objective");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      width={400}
      open={open}
      onClose={onClose}
      closable={false}
      title="Add Course Objective"
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            Save
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label="Objective Name"
          rules={[{ required: true, message: "Please enter name" }]}
        >
          <Input placeholder="Objective name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} placeholder="Objective description" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddObjectiveDrawer;
