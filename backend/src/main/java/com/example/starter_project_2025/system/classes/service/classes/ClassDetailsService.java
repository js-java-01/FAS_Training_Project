package com.example.starter_project_2025.system.classes.service.classes;

import com.example.starter_project_2025.system.classes.dto.request.CourseSearchRequest;
import com.example.starter_project_2025.system.classes.dto.response.CourseDetailsResponse;
import com.example.starter_project_2025.system.classes.dto.response.TraineeDetailsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ClassDetailsService
{
    Page<TraineeDetailsResponse> getTraineesOfClass(UUID classId, String keyword, Pageable pageable);

    Page<CourseDetailsResponse> getCoursesOfClass(UUID classId, CourseSearchRequest request, Pageable pageable);
}
