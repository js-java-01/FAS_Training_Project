package com.example.starter_project_2025.system.learning.controller;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.classes.service.classes.ClassService;
import com.example.starter_project_2025.system.learning.dto.EnrollmentImportResult;
import com.example.starter_project_2025.system.learning.dto.EnrollmentRequest;
import com.example.starter_project_2025.system.learning.service.enroll.EnrollmentService;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

        private final EnrollmentService enrollmentService;

        @PostMapping("")
        public ResponseEntity<String> enroll(
                        @Valid @RequestBody EnrollmentRequest request) {

                String result = enrollmentService.enroll(request);
                return ResponseEntity.ok(result);
        }

        @GetMapping("/export/template")
        public ResponseEntity<byte[]> getExportTemplate() {
                byte[] template = enrollmentService.getExportTemplate();
                return ResponseEntity.ok()
                                .contentType(
                                                MediaType.parseMediaType(
                                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=enrollment_template.xlsx")
                                .body(template);
        }

        @PostMapping(value = "/import/{classCode}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<EnrollmentImportResult> importStudents(
                        @PathVariable("classCode") String classCode,
                        @RequestPart("file") MultipartFile file) {

                EnrollmentImportResult result = enrollmentService.importStudents(file, classCode);
                return ResponseEntity.ok(result);
        }

        @GetMapping("/export/{classCode}")
        public ResponseEntity<byte[]> getExportByClassCode(@PathVariable("classCode") String classCode) {
                byte[] template = enrollmentService.getExport(classCode);
                return ResponseEntity.ok()
                                .contentType(
                                                MediaType.parseMediaType(
                                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=enrollment_export_" + classCode + ".xlsx")
                                .body(template);
        }

}