import { Drawer, Form, Input, Button, message, Space } from "antd";
import { useEffect, useState } from "react";
import { courseApi } from "../../../api/courseApi";

interface Props {
  open: boolean;
  onClose: () => void;
  courseId: string;
  objective: {
    id: string;
    name: string;
    description?: string;
  } | null;
  onSuccess: () => void;
}

const EditObjectiveDrawer = ({
  open,
  onClose,
  courseId,
  objective,
  onSuccess,
}: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  //  Pre-fill data khi mở drawer
  useEffect(() => {
    if (objective) {
      form.setFieldsValue({
        name: objective.name,
        description: objective.description,
      });
    }
  }, [objective, form]);

  const handleUpdate = async () => {
    if (!objective) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      await courseApi.updateObjective(courseId, objective.id, values);

      message.success("Objective updated successfully");
      onClose();
      onSuccess();
    } catch (err) {
      message.error("Failed to update objective");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Edit Course Objective"
      width={400}
      open={open}
      onClose={onClose}
      closable={false}
      maskClosable={false}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleUpdate} loading={loading}>
            Update
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Please enter objective name" },
            { max: 100, message: "Maximum 100 characters" },
          ]}
        >
          <Input placeholder="Objective name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ max: 500, message: "Maximum 500 characters" }]}
        >
          <Input.TextArea rows={4} placeholder="Objective description" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditObjectiveDrawer;
