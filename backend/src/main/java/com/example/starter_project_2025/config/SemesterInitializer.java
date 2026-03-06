package com.example.starter_project_2025.config;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SemesterInitializer {
    private final SemesterRepository semesterRepository;

    public void initializeSemester() {

        if (semesterRepository.count() > 0) {
            return;
        }

        List<Semester> semesters = List.of(
                buildSemester("Fall 2025", LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 31)),
                buildSemester("Spring 2026", LocalDate.of(2026, 1, 5), LocalDate.of(2026, 4, 30)),
                buildSemester("Summer 2026", LocalDate.of(2026, 5, 5), LocalDate.of(2026, 8, 30)),
                buildSemester("Fall 2026", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 12, 31)));
        semesterRepository.saveAll(semesters);
        // log.info("Initialized {} Semesters successfully.", semesters.size());
    }

    private Semester buildSemester(String name, LocalDate start, LocalDate end) {
        Semester s = new Semester();
        s.setName(name);
        s.setStartDate(start);
        s.setEndDate(end);
        return s;
    }
}
