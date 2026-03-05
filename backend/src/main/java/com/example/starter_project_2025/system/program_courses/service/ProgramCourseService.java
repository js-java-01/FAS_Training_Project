package com.example.starter_project_2025.system.program_courses.service;

import com.example.starter_project_2025.system.program_courses.dto.request.CreateProgramCourseRequest;
import com.example.starter_project_2025.system.program_courses.dto.response.ProgramCourseResponse;

public interface ProgramCourseService {

    ProgramCourseResponse create(CreateProgramCourseRequest request);
}