import type { StudentScheduleResponse } from "./studentSchedule.mock";


export interface StudentSchedule {
  id: string;
  subject: string;
  room: string;
  lecturer: string;
  date: string;
  startTime: string;
  endTime: string;
  attendanceStatus:
    | "PRESENT"
    | "ABSENT"
    | "NOT_YET";
}

// transform BE → UI model
export function transformStudentSchedule(
  data: StudentScheduleResponse[]
): StudentSchedule[] {
  return data.map((item) => ({
    id: item.id,
    subject: item.subjectName,
    room: item.roomName,
    lecturer: item.trainerName,
    date: item.studyDate,
    startTime: item.startTime,
    endTime: item.endTime,
    attendanceStatus: item.attendanceStatus,
  }));
}
