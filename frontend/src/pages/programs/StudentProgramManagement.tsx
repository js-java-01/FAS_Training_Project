import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen, Clock3, Layers } from "lucide-react";

type ProgramLevel = "Beginner" | "Intermediate" | "Advanced";

type StudentProgram = {
  id: string;
  code: string;
  name: string;
  version: string;
  level: ProgramLevel;
  durationWeeks: number;
  topicCount: number;
  summary: string;
  status: "OPEN" | "COMING_SOON";
};

const MOCK_PROGRAMS: StudentProgram[] = [
  {
    id: "p-01",
    code: "JAVA-BE",
    name: "Java Backend Developer",
    version: "v1.0",
    level: "Intermediate",
    durationWeeks: 16,
    topicCount: 24,
    summary: "Lộ trình backend với Java, Spring Boot, REST API và database.",
    status: "OPEN",
  },
  {
    id: "p-02",
    code: "FS-JS",
    name: "Fullstack JavaScript",
    version: "v1.1",
    level: "Beginner",
    durationWeeks: 18,
    topicCount: 28,
    summary: "Học fullstack từ nền tảng web đến React và Node.js.",
    status: "OPEN",
  },
  {
    id: "p-03",
    code: "DATA-ENG",
    name: "Data Engineering Foundation",
    version: "v1.0",
    level: "Advanced",
    durationWeeks: 20,
    topicCount: 30,
    summary: "Nền tảng xử lý dữ liệu, ETL, data warehouse và pipeline.",
    status: "COMING_SOON",
  },
  {
    id: "p-04",
    code: "CLOUD-SEC",
    name: "Cloud Security Specialist",
    version: "v0.9",
    level: "Intermediate",
    durationWeeks: 14,
    topicCount: 20,
    summary: "Bảo mật cloud, IAM, network security và best practices.",
    status: "COMING_SOON",
  },
];

export default function StudentProgramManagement() {
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<string>("all");

  const filteredPrograms = useMemo(() => {
    return MOCK_PROGRAMS.filter((program) => {
      const matchedKeyword =
        program.name.toLowerCase().includes(keyword.toLowerCase()) ||
        program.code.toLowerCase().includes(keyword.toLowerCase());
      const matchedLevel = level === "all" ? true : program.level === level;
      return matchedKeyword && matchedLevel;
    });
  }, [keyword, level]);

  return (
    <MainLayout pathName={{ programs: "Programs" }}>
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Programs</h1>
          <p className="text-muted-foreground">
            Chọn chương trình phù hợp để xem lộ trình học tập.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên hoặc mã chương trình..."
              className="pl-9"
            />
          </div>

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full md:w-55">
              <SelectValue placeholder="Filter level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="h-full">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline">{program.code}</Badge>
                  <Badge variant={program.status === "OPEN" ? "default" : "secondary"}>
                    {program.status === "OPEN" ? "Open" : "Coming Soon"}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">{program.name}</CardTitle>
                <CardDescription>{program.version}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground line-clamp-3">{program.summary}</p>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>Level: {program.level}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <span>{program.durationWeeks} weeks</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{program.topicCount} topics</span>
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full" disabled={program.status !== "OPEN"}>
                  View Program
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Không tìm thấy program phù hợp với điều kiện lọc.
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
