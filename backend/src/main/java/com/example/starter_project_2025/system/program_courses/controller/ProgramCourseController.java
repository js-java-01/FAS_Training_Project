package com.example.starter_project_2025.system.program_courses.controller;

import com.example.starter_project_2025.system.program_courses.dto.request.CreateProgramCourseRequest;
import com.example.starter_project_2025.system.program_courses.dto.response.ProgramCourseResponse;
import com.example.starter_project_2025.system.program_courses.service.ProgramCourseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/program-courses")
@RequiredArgsConstructor
public class ProgramCourseController {

    private final ProgramCourseService programCourseService;

    @PostMapping
    public ResponseEntity<ProgramCourseResponse> create(
            @Valid @RequestBody CreateProgramCourseRequest request
    ) {
        return ResponseEntity.ok(programCourseService.create(request));
    }
}