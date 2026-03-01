package com.example.starter_project_2025.system.semester.services;

import com.example.starter_project_2025.system.semester.dto.SemesterCreateDto;
import com.example.starter_project_2025.system.semester.dto.SemesterResponse;
import com.example.starter_project_2025.system.semester.dto.SemesterUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SemesterService
{
    List<SemesterResponse> getByUserId(UUID userId);

    SemesterResponse createSemester(SemesterCreateDto data);

    SemesterResponse updateSemester(SemesterUpdateDto data);

    void deleteSemester(UUID id);

    Page<SemesterResponse> getAllSemesters(UUID userId, String role, String keyword, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
