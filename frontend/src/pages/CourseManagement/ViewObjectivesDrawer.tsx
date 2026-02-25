import { Drawer, Descriptions } from "antd";
import type { CourseObjective } from "../../types/courseObjective";
interface Props {
  open: boolean;
  onClose: () => void;
  objective: CourseObjective | null;
}

const ViewObjectiveDrawer = ({ open, onClose, objective }: Props) => {
  return (
    <Drawer title="Objective Detail" open={open} onClose={onClose} width={500}>
      {objective && (
        <Descriptions column={1}>
          <Descriptions.Item label="Name">
            {objective.name}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {objective.description}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
};

export default ViewObjectiveDrawer;