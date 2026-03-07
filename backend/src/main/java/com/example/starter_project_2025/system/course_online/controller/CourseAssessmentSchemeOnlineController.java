package com.example.starter_project_2025.system.course_online.controller;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentSchemeOnlineConfigDTO;
import com.example.starter_project_2025.system.course_online.service.CourseAssessmentSchemeOnlineService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/assessment-scheme")
@RequiredArgsConstructor
public class CourseAssessmentSchemeOnlineController {

    private final CourseAssessmentSchemeOnlineService service;

    @GetMapping("/config")
    public CourseAssessmentSchemeOnlineConfigDTO getConfig(
            @PathVariable UUID courseId) {

        return service.getSchemeConfig(courseId);
    }

    @PutMapping("/config")
    public void updateConfig(
            @PathVariable UUID courseId,
            @Valid @RequestBody CourseAssessmentSchemeOnlineConfigDTO dto) {

        service.updateSchemeConfig(courseId, dto);
    }

    @GetMapping("/components")
    public List<CourseAssessmentComponentOnlineResponse> getComponents(
            @PathVariable UUID courseId) {

        return service.getComponents(courseId);
    }

    @PutMapping("/components")
    public void updateComponents(
            @PathVariable UUID courseId,
            @Valid @RequestBody List<CourseAssessmentComponentOnlineRequest> request) {

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

    @GetMapping("/components/export")
    public ResponseEntity<byte[]> exportComponents(@PathVariable UUID courseId) {
        byte[] data = service.exportComponents(courseId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment",
                "assessment_components_course_" + courseId + ".xlsx");
        return ResponseEntity.ok().headers(headers).body(data);
    }

    @PostMapping("/components/import")
    public ImportResultResponse importComponents(
            @PathVariable UUID courseId,
            @RequestParam("file") MultipartFile file) {

        return service.importComponents(courseId, file);
    }

    @GetMapping("/components/template")
    public ResponseEntity<byte[]> downloadComponentsTemplate(@PathVariable UUID courseId) {
        byte[] data = service.downloadComponentsTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment",
                "assessment_components_template.xlsx");
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
