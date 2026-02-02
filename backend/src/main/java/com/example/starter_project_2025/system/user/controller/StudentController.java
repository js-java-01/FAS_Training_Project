package com.example.starter_project_2025.system.user.controller;

import com.example.starter_project_2025.system.user.dto.CreateStudentRequest;
import com.example.starter_project_2025.system.user.dto.StudentDTO;
import com.example.starter_project_2025.system.user.enums.Gender;
import com.example.starter_project_2025.system.user.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students") 
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;


    @GetMapping
    @Operation(summary = "Get all students", description = "Retrieve all students with pagination")
    public ResponseEntity<Page<StudentDTO>> getAllStudents(
            @RequestParam(required = false) String searchContent,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) BigDecimal minGpa,
            @RequestParam(required = false) BigDecimal maxGpa,
            @RequestParam(required = false) LocalDate dobFrom,
            @RequestParam(required = false) LocalDate dobTo,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(studentService.getAllStudents(
                searchContent,
                gender,
                minGpa,
                maxGpa,
                dobFrom,
                dobTo,
                pageable
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID", description = "Retrieve a specific student by ID")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    @Operation(summary = "Create student", description = "Create a new student")
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentService.createStudent(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update student", description = "Update an existing student")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable UUID id,
            @Valid @RequestBody StudentDTO request
    ) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete student", description = "Delete a student by ID")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}