package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class TrainingClassInitializer {
    private final TrainingClassRepository trainingClassRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;
    private final TrainingProgramRepository trainingProgramRepository;
    private TrainingClass buildTrainingClass(String name, String code, User creator, Semester semester,
                                             LocalDate start, LocalDate end, User approvedBy, TrainingProgram program) {
        Random random = new Random();
        TrainingClass tc = new TrainingClass();
        tc.setClassName(name);
        tc.setClassCode(code);

        tc.setCreator(creator);
        tc.setSemester(semester);
        tc.setStartDate(start);
        tc.setEndDate(end);
        tc.setApprover(approvedBy);
        tc.setTrainingProgram(program);
        if (random.nextBoolean()) {
            // tc.setEnrollmentKey("abc");s
            tc.setIsActive(true);
        } else {

            tc.setIsActive(false);
        }

        return tc;
    }

    public void initializeTrainingClasses() {
        if (trainingClassRepository.count() > 0) {
            return;
        }

        User admin = userRepository.findByEmail("admin@example.com")
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        User manager = userRepository.findByEmail("manager1@example.com")
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        Map<String, Semester> semesterMap = semesterRepository.findAll().stream()
                .collect(Collectors.toMap(Semester::getName, s -> s));

        if (semesterMap.isEmpty()) {
            return;
        }
        TrainingProgram seProgram = trainingProgramRepository.findByName("Java Backend Developer")
                .orElseThrow(() -> new RuntimeException("Training program not found"));

        List<TrainingClass> classes = List.of(
                buildTrainingClass("Kỹ sư phần mềm - Khóa 1", "SE-K1-01", manager,
                        semesterMap.get("Fall 2025"), LocalDate.of(2025, 9, 10),
                        LocalDate.of(2025, 12, 20), admin, seProgram),

                buildTrainingClass("Hệ thống thông tin - Khóa 1", "IS-K1-01", manager,
                        semesterMap.get("Fall 2025"), LocalDate.of(2025, 9, 15),
                        LocalDate.of(2025, 12, 25), admin, seProgram),

                buildTrainingClass("Kỹ sư phần mềm - Khóa 2", "SE-K2-01", manager,
                        semesterMap.get("Spring 2026"), LocalDate.of(2026, 1, 10),
                        LocalDate.of(2026, 4, 20), admin,seProgram),

                buildTrainingClass("Khoa học dữ liệu - Khóa 1", "DS-K1-01", manager,
                        semesterMap.get("Spring 2026"), LocalDate.of(2026, 1, 15),
                        LocalDate.of(2026, 4, 25), admin,seProgram),

                buildTrainingClass("Trí tuệ nhân tạo - Khóa 1", "AI-K1-01", manager,
                        semesterMap.get("Summer 2026"), LocalDate.of(2026, 5, 10),
                        LocalDate.of(2026, 8, 20), admin,seProgram),

                buildTrainingClass("An toàn thông tin - Khóa 1", "CS-K1-01", manager,
                        semesterMap.get("Summer 2026"), LocalDate.of(2026, 5, 15),
                        LocalDate.of(2026, 8, 25), admin,seProgram),

                buildTrainingClass("Kỹ sư phần mềm - Khóa 3", "SE-K3-01", manager,
                        semesterMap.get("Fall 2026"), LocalDate.of(2026, 9, 10),
                        LocalDate.of(2026, 12, 20), admin,seProgram),

                buildTrainingClass("Thiết kế đồ họa - Khóa 1", "GD-K1-01", manager,
                        semesterMap.get("Fall 2026"), LocalDate.of(2026, 9, 15),
                        LocalDate.of(2026, 12, 25), admin,seProgram));
        List<TrainingClass> validClasses = classes.stream()
                .filter(c -> c.getSemester() != null)
                .toList();

        trainingClassRepository.saveAll(validClasses);
    }


}
