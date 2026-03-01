package com.example.starter_project_2025.system.classes.controller;

import com.example.starter_project_2025.system.classes.dto.request.CourseSearchRequest;
import com.example.starter_project_2025.system.classes.dto.response.CourseDetailsResponse;
import com.example.starter_project_2025.system.classes.dto.response.TraineeDetailsResponse;
import com.example.starter_project_2025.system.classes.service.classes.ClassDetailsServiceImpl;
import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassDetailsController
{
    private final ClassDetailsServiceImpl classDetailsService;

    @GetMapping("/trainer/{classId}/trainees")
    @PreAuthorize("hasAuthority('CLASS_READ')")
    public ResponseEntity<ApiResponse<PageResponse<TraineeDetailsResponse>>> getTraineeClassDetails(
            @PathVariable UUID classId,
            @RequestParam(required = true) String keyword,
            Pageable pageable
    )
    {
        var response = classDetailsService.getTraineesOfClass(classId, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(response), "Trainee class details retrieved successfully"));
    }

    @GetMapping("/trainer/{classId}/courses")
    @PreAuthorize("hasAuthority('CLASS_READ')")
    public ResponseEntity<ApiResponse<PageResponse<CourseDetailsResponse>>> getCourseClassDetails(
            @PathVariable UUID classId,
            @ModelAttribute CourseSearchRequest request,
            Pageable pageable
    )
    {
        var response = classDetailsService.getCoursesOfClass(classId, request, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(response), "Course class details retrieved successfully"));
    }
}
