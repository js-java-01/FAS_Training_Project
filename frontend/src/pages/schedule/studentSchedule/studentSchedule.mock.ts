export interface StudentScheduleResponse {
  id: string;
  topicCode: string;
  topicName: string;
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
    topicCode: "RJS",
    topicName: "ReactJS Advanced",
    roomName: "Room A1",
    trainerName: "Nguyen Van A",
    studyDate: "2026-03-10",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "2",
    topicCode: "TS",
    topicName: "TypeScript Deep Dive",
    roomName: "Room B2",
    trainerName: "Tran Thi B",
    studyDate: "2026-03-10",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "3",
    topicCode: "SS",
    topicName: "Soft Skills Training",
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
    topicCode: "JP",
    topicName: "Japanese N3",
    roomName: "Room D1",
    trainerName: "Yamada Sensei",
    studyDate: "2026-03-12",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "5",
    topicCode: "BA",
    topicName: "Business Analysis",
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
    topicCode: "FP",
    topicName: "Frontend Project",
    roomName: "Lab 1",
    trainerName: "Tran Van Dev",
    studyDate: "2026-03-13",
    startTime: "09:00",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "7",
    topicCode: "CR",
    topicName: "Code Review Session",
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
    topicCode: "GW",
    topicName: "Git & Workflow",
    roomName: "Room A2",
    trainerName: "Hoang Anh",
    studyDate: "2026-02-25",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "PRESENT",
  },
  {
    id: "9",
    topicCode: "DB",
    topicName: "Database Design",
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
    topicCode: "CW",
    topicName: "Career Orientation Workshop",
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
    topicCode: "EC",
    topicName: "English Communication",
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
    topicCode: "FC",
    topicName: "Fullstack Capstone",
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
    topicCode: "MA",
    topicName: "Microservices Architecture",
    roomName: "Room F1",
    trainerName: "System Architect",
    studyDate: "2026-03-23",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "14",
    topicCode: "DC",
    topicName: "Docker & DevOps",
    roomName: "Lab DevOps",
    trainerName: "Cloud Engineer",
    studyDate: "2026-03-23",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "15",
    topicCode: "AS",
    topicName: "Agile & Scrum",
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
    topicCode: "SD",
    topicName: "System Design",
    roomName: "Hall 2",
    trainerName: "Tech Lead",
    studyDate: "2026-03-25",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "17",
    topicCode: "CC",
    topicName: "Clean Code",
    roomName: "Hall 2",
    trainerName: "Senior Dev",
    studyDate: "2026-03-25",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "18",
    topicCode: "UT",
    topicName: "Unit Testing",
    roomName: "Hall 2",
    trainerName: "QA Lead",
    studyDate: "2026-03-25",
    startTime: "13:00",
    endTime: "15:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "19",
    topicCode: "CI",
    topicName: "CI/CD Pipeline",
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
    topicCode: "UI",
    topicName: "UI/UX Design",
    roomName: "Design Lab",
    trainerName: "UX Mentor",
    studyDate: "2026-03-26",
    startTime: "09:00",
    endTime: "11:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "21",
    topicCode: "FW",
    topicName: "Figma Workshop",
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
    topicCode: "PB",
    topicName: "Final Project Briefing",
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
    topicCode: "ARP",
    topicName: "Advanced React Patterns",
    roomName: "Room A1",
    trainerName: "React Expert",
    studyDate: "2026-04-02",
    startTime: "08:00",
    endTime: "10:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "24",
    topicCode: "NG",
    topicName: "NextJS Full Guide",
    roomName: "Room A1",
    trainerName: "Frontend Architect",
    studyDate: "2026-04-02",
    startTime: "10:15",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "25",
    topicCode: "BN",
    topicName: "Backend with NodeJS",
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
    topicCode: "AI",
    topicName: "AI for Developers",
    roomName: "Innovation Lab",
    trainerName: "AI Specialist",
    studyDate: "2026-04-10",
    startTime: "09:00",
    endTime: "12:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "27",
    topicCode: "CA",
    topicName: "Cloud Architecture",
    roomName: "Cloud Room",
    trainerName: "AWS Architect",
    studyDate: "2026-04-15",
    startTime: "08:00",
    endTime: "11:00",
    attendanceStatus: "NOT_YET",
  },
  {
    id: "28",
    topicCode: "SP",
    topicName: "Security Best Practices",
    roomName: "Security Lab",
    trainerName: "Security Expert",
    studyDate: "2026-04-20",
    startTime: "13:00",
    endTime: "16:00",
    attendanceStatus: "NOT_YET",
  },
];
