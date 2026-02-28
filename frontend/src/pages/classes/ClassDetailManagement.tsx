import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ClassTraineesTable from "./component/ClassTraineesTable";
import ClassCoursesTable from "./component/ClassCoursesTable";

interface ClassDetailManagementProps {
  classId: string;
  className: string;
  onBack: () => void;
}

export default function ClassDetailManagement({ classId, className, onBack }: ClassDetailManagementProps) {
  if (!classId) return <div>Không tìm thấy ID lớp học!</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <Breadcrumb className="shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
            >
              Danh sách lớp học
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">{className}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs defaultValue="trainees" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit shrink-0 mb-4">
          <TabsTrigger value="trainees">Danh sách Học viên</TabsTrigger>
          <TabsTrigger value="courses">Danh sách Môn học</TabsTrigger>
        </TabsList>

        <TabsContent value="trainees" className="flex-1 min-h-0 flex flex-col outline-none mt-0">
          <ClassTraineesTable classId={classId} />
        </TabsContent>

        <TabsContent value="courses" className="flex-1 min-h-0 flex flex-col outline-none mt-0">
          <ClassCoursesTable classId={classId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
