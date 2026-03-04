export interface StudentScheduleResponse {
  id: string;
  subjectName: string;
  roomName: string;
  trainerName: string;
  studyDate: string;
  startTime: string;
  endTime: string;
  attendanceStatus:
    | "PRESENT"
    | "ABSENT"
    | "NOT_YET";
}

export const studentScheduleMock: StudentScheduleResponse[] = [
  // ===== WEEK 1 =====
  {
    id: "1",
    subjectName: "ReactJS Advanced",
    roomName: "Room A1",
    trainerName: "Nguyen Van A",
    studyDate: "2026-03-10",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "2",
    subjectName: "TypeScript Deep Dive",
    roomName: "Room B2",
    trainerName: "Tran Thi B",
    studyDate: "2026-03-10",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "3",
    subjectName: "Soft Skills Training",
    roomName: "Room C3",
    trainerName: "Le Van C",
    studyDate: "2026-03-11",
    startTime: "13:00",
    endTime: "15:00",
    attendanceStatus: "ABSENT",
  },

  // ===== SAME DAY MULTIPLE CLASSES =====
  {
    id: "4",
    subjectName: "Japanese N3",
    roomName: "Room D1",
    trainerName: "Yamada Sensei",
    studyDate: "2026-03-12",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "5",
    subjectName: "Business Analysis",
    roomName: "Room D1",
    trainerName: "Pham Minh",
    studyDate: "2026-03-12",
    startTime: "10:30",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },

  // ===== OVERLAPPING TIME (test UI) =====
  {
    id: "6",
    subjectName: "Frontend Project",
    roomName: "Lab 1",
    trainerName: "Tran Van Dev",
    studyDate: "2026-03-13",
    startTime: "09:00",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "7",
    subjectName: "Code Review Session",
    roomName: "Lab 2",
    trainerName: "Senior Mentor",
    studyDate: "2026-03-13",
    startTime: "10:00",
    endTime: "11:30",
    attendanceStatus: "NOT_YET",
  },

  // ===== PAST CLASSES =====
  {
    id: "8",
    subjectName: "Git & Workflow",
    roomName: "Room A2",
    trainerName: "Hoang Anh",
    studyDate: "2026-02-25",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "9",
    subjectName: "Database Design",
    roomName: "Room B1",
    trainerName: "Nguyen DBA",
    studyDate: "2026-02-26",
    startTime: "13:00",
    endTime: "15:00",
    attendanceStatus: "ABSENT",
  },

  // ===== WORKSHOP SPECIAL =====
  {
    id: "10",
    subjectName: "Career Orientation Workshop",
    roomName: "Hall 1",
    trainerName: "HR Team",
    studyDate: "2026-03-15",
    startTime: "09:00",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },

  // ===== EVENING CLASS =====
  {
    id: "11",
    subjectName: "English Communication",
    roomName: "Room E1",
    trainerName: "John Smith",
    studyDate: "2026-03-16",
    startTime: "18:00",
    endTime: "20:00",
    attendanceStatus: "NOT_YET",
  },

  // ===== WEEKEND CLASS =====
  {
    id: "12",
    subjectName: "Fullstack Capstone",
    roomName: "Lab 3",
    trainerName: "Architect Lead",
    studyDate: "2026-03-21",
    startTime: "08:00",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  // ===== WEEK 3 =====
  {
    id: "13",
    subjectName: "Microservices Architecture",
    roomName: "Room F1",
    trainerName: "System Architect",
    studyDate: "2026-03-23",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "14",
    subjectName: "Docker & DevOps",
    roomName: "Lab DevOps",
    trainerName: "Cloud Engineer",
    studyDate: "2026-03-23",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "15",
    subjectName: "Agile & Scrum",
    roomName: "Room Agile",
    trainerName: "Scrum Master",
    studyDate: "2026-03-24",
    startTime: "13:00",
    endTime: "15:00",
    attendanceStatus: "NOT_YET",
  },

  // ===== HEAVY DAY TEST =====
  {
    id: "16",
    subjectName: "System Design",
    roomName: "Hall 2",
    trainerName: "Tech Lead",
    studyDate: "2026-03-25",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "17",
    subjectName: "Clean Code",
    roomName: "Hall 2",
    trainerName: "Senior Dev",
    studyDate: "2026-03-25",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "18",
    subjectName: "Unit Testing",
    roomName: "Hall 2",
    trainerName: "QA Lead",
    studyDate: "2026-03-25",
    startTime: "13:00",
    endTime: "15:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "19",
    subjectName: "CI/CD Pipeline",
    roomName: "Hall 2",
    trainerName: "DevOps Lead",
    studyDate: "2026-03-25",
    startTime: "15:15",
    endTime: "17:00",
    attendanceStatus: "NOT_YET",
  },

  // ===== OVERLAP TEST 2 =====
  {
    id: "20",
    subjectName: "UI/UX Design",
    roomName: "Design Lab",
    trainerName: "UX Mentor",
    studyDate: "2026-03-26",
    startTime: "09:00",
    endTime: "11:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "21",
    subjectName: "Figma Workshop",
    roomName: "Design Lab",
    trainerName: "UI Specialist",
    studyDate: "2026-03-26",
    startTime: "10:00",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },

  // ===== END OF MONTH =====
  {
    id: "22",
    subjectName: "Final Project Briefing",
    roomName: "Main Hall",
    trainerName: "Program Manager",
    studyDate: "2026-03-30",
    startTime: "09:00",
    endTime: "11:00",
    attendanceStatus: "NOT_YET",
  },

  // ===== NEXT MONTH (APRIL) =====
  {
    id: "23",
    subjectName: "Advanced React Patterns",
    roomName: "Room A1",
    trainerName: "React Expert",
    studyDate: "2026-04-02",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "24",
    subjectName: "NextJS Full Guide",
    roomName: "Room A1",
    trainerName: "Frontend Architect",
    studyDate: "2026-04-02",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "25",
    subjectName: "Backend with NodeJS",
    roomName: "Room B3",
    trainerName: "Backend Lead",
    studyDate: "2026-04-05",
    startTime: "13:00",
    endTime: "15:30",
    attendanceStatus: "NOT_YET",
  },

  // ===== RANDOM FUTURE TEST =====
  {
    id: "26",
    subjectName: "AI for Developers",
    roomName: "Innovation Lab",
    trainerName: "AI Specialist",
    studyDate: "2026-04-10",
    startTime: "09:00",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "27",
    subjectName: "Cloud Architecture",
    roomName: "Cloud Room",
    trainerName: "AWS Architect",
    studyDate: "2026-04-15",
    startTime: "08:00",
    endTime: "11:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "28",
    subjectName: "Security Best Practices",
    roomName: "Security Lab",
    trainerName: "Security Expert",
    studyDate: "2026-04-20",
    startTime: "13:00",
    endTime: "16:00",
    attendanceStatus: "NOT_YET",
  },
];
