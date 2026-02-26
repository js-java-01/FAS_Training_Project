package com.example.starter_project_2025.system.semester.repository;

import java.time.LocalDate;

public interface SemesterOptionProjection {
    byte[] getId();
    String getName();
    LocalDate getStartDate();
    LocalDate getEndDate();
}
