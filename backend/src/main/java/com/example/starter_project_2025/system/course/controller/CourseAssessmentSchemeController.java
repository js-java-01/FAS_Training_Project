package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.CourseAssessmentComponentRequest;
import com.example.starter_project_2025.system.course.dto.CourseAssessmentComponentResponse;
import com.example.starter_project_2025.system.course.dto.CourseAssessmentSchemeConfigDTO;
import com.example.starter_project_2025.system.course.service.CourseAssessmentSchemeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/assessment-scheme")
@RequiredArgsConstructor
public class CourseAssessmentSchemeController {

    private final CourseAssessmentSchemeService service;

    @GetMapping("/config")
    public CourseAssessmentSchemeConfigDTO getConfig(
            @PathVariable UUID courseId) {

        return service.getSchemeConfig(courseId);
    }

    @PutMapping("/config")
    public void updateConfig(
            @PathVariable UUID courseId,
            @Valid @RequestBody CourseAssessmentSchemeConfigDTO dto) {

        service.updateSchemeConfig(courseId, dto);
    }

    @GetMapping("/components")
    public List<CourseAssessmentComponentResponse> getComponents(
            @PathVariable UUID courseId) {

        return service.getComponents(courseId);
    }

    @PutMapping("/components")
    public void updateComponents(
            @PathVariable UUID courseId,
            @Valid @RequestBody List<CourseAssessmentComponentRequest> request) {

        service.updateComponents(courseId, request);
    }

    @DeleteMapping("/components/{componentId}")
    public void deleteComponent(
            @PathVariable UUID courseId,
            @PathVariable UUID componentId) {

        service.deleteComponent(courseId, componentId);
    }

    @PostMapping("/clone-from-topic/{topicId}")
    public void cloneFromTopic(
            @PathVariable UUID courseId,
            @PathVariable UUID topicId) {

        service.cloneFromTopic(topicId, courseId);
    }
}
