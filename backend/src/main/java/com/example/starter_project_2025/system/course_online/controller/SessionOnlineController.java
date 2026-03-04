package com.example.starter_project_2025.system.course_online.controller;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.SessionOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.SessionOnlineResponse;
import com.example.starter_project_2025.system.course_online.service.SessionOnlineService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Tag(name = "SessionOnline Management", description = "APIs dành cho quản lý SessionOnline (Buổi học)")
@SecurityRequirement(name = "Bearer Authentication")
public class SessionOnlineController {

    private final SessionOnlineService sessionService;

    @PostMapping
    @Operation(summary = "Tạo mới SessionOnline")
    public ResponseEntity<SessionOnlineResponse> createSession(@Valid @RequestBody SessionOnlineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.createSession(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật SessionOnline")
    public ResponseEntity<SessionOnlineResponse> updateSession(
            @PathVariable UUID id,
            @Valid @RequestBody SessionOnlineRequest request) {
        return ResponseEntity.ok(sessionService.updateSession(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa SessionOnline")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết SessionOnline")
    public ResponseEntity<SessionOnlineResponse> getSessionById(@PathVariable UUID id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @GetMapping("/lesson/{lessonId}")
    @Operation(summary = "Lấy danh sách SessionOnline theo Lesson")
    public ResponseEntity<List<SessionOnlineResponse>> getSessionsByLesson(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(sessionService.getSessionsByLesson(lessonId));
    }

    @GetMapping("/export/lesson/{lessonId}")
    @Operation(summary = "Xuất danh sách SessionOnline ra Excel theo Lesson")
    public ResponseEntity<byte[]> exportSessions(@PathVariable UUID lessonId) {
        return sessionService.exportSessions(lessonId);
    }

    @GetMapping("/template")
    @Operation(summary = "Tải template import SessionOnline")
    public ResponseEntity<byte[]> downloadSessionTemplate() {
        return sessionService.downloadSessionTemplate();
    }

    @PostMapping(value = "/import/lesson/{lessonId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import SessionOnline từ file Excel theo Lesson")
    public ResponseEntity<ImportResultResponse> importSessions(
            @PathVariable UUID lessonId,
            @RequestPart("file") MultipartFile file) {
        ImportResultResponse result = sessionService.importSessions(lessonId, file);
        return ResponseEntity.ok(result);
    }
}