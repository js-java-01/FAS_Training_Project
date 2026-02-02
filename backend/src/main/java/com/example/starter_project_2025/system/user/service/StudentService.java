package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.user.dto.CreateStudentRequest;
import com.example.starter_project_2025.system.user.dto.StudentDTO;
import com.example.starter_project_2025.system.user.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public interface StudentService {

    Page<StudentDTO> getAllStudents(
            String searchContent,
            Gender gender,
            BigDecimal minGpa,
            BigDecimal maxGpa,
            LocalDate dobFrom,
            LocalDate dobTo,
            Pageable pageable
    );

    StudentDTO getStudentById(UUID id);

    StudentDTO createStudent(CreateStudentRequest request);

    StudentDTO updateStudent(UUID id, StudentDTO request);

    void deleteStudent(UUID id);
}