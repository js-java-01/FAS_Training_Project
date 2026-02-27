import type { TrainingClass } from "@/types/trainingClass";

export const MOCK: TrainingClass[] = [
    {
        id: "1",
        className: "Lập trình Java nâng cao",
        classCode: "SP26_JAVA01",
        description: "Học về Spring Boot và Microservices",
        isActive: true,
        creatorName: "Nguyễn Văn Sơn",
        approverName: "Trần Thu Hà",
        semesterName: "Spring 2026",
        startDate: "2026-01-15",
        endDate: "2026-05-30",
        trainerNames: ["Nguyễn Văn Sơn", "Lê Thị Lan"] // Theo cấu trúc Response mới của ông
    },
    {
        id: "2",
        className: "Phát triển Web với React & Next.js",
        classCode: "SP26_REACT02",
        description: "Làm chủ Frontend hiện đại",
        isActive: true,
        creatorName: "Phạm Minh Tuấn",
        approverName: "Trần Thu Hà",
        semesterName: "Spring 2026",
        startDate: "2026-01-20",
        endDate: "2026-06-15",
        trainerNames: ["Phạm Minh Tuấn"]
    },
    {
        id: "3",
        className: "Cấu trúc dữ liệu và Giải thuật",
        classCode: "FA25_DSA01",
        description: "Nền tảng cho mọi lập trình viên",
        isActive: false,
        creatorName: "Hoàng Anh Đức",
        approverName: "Trần Thu Hà",
        semesterName: "Fall 2025",
        startDate: "2025-08-15",
        endDate: "2025-12-20",
        trainerNames: ["Hoàng Anh Đức", "Bùi Thế Anh"]
    },
    {
        id: "4",
        className: "Lập trình C# cơ bản",
        classCode: "FA25_CSHARP01",
        description: "Học .NET Core",
        isActive: false,
        creatorName: "Lý Hải Nam",
        approverName: "Trần Thu Hà",
        semesterName: "Fall 2025",
        startDate: "2025-09-01",
        endDate: "2025-12-30",
        trainerNames: ["Lý Hải Nam"]
    },
    {
        id: "5",
        className: "Cơ sở dữ liệu SQL Server",
        classCode: "SU25_SQL01",
        description: "Thiết kế và tối ưu hóa DB",
        isActive: false,
        creatorName: "Đặng Thị Hồng",
        approverName: "Trần Thu Hà",
        semesterName: "Summer 2025",
        startDate: "2025-05-15",
        endDate: "2025-08-15",
        trainerNames: ["Đặng Thị Hồng"]
    }
];