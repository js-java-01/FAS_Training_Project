import { EntityCalendar } from "@/components/calendar/EntityCalendar";
import { transformStudentSchedule } from "./studentCalendar.service";
import { studentScheduleMock } from "./studentSchedule.mock";
import { studentCalendarAdapter } from "./student.adapter";
import { MainLayout } from "@/components/layout/MainLayout";


export default function StudentCalendarPage() {
  const apiResponse = studentScheduleMock;
  const scheduleData = transformStudentSchedule(apiResponse);

  return (
    <MainLayout>
      <EntityCalendar
        data={scheduleData}
        adapter={studentCalendarAdapter}
      />
    </MainLayout>
  );
}
