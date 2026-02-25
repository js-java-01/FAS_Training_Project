package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.SessionRequest;
import com.example.starter_project_2025.system.course.dto.SessionResponse;
import com.example.starter_project_2025.system.course.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Tag(name = "Session Management", description = "APIs dành cho quản lý Session (Buổi học)")
@SecurityRequirement(name = "Bearer Authentication")
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    @Operation(summary = "Tạo mới Session")
    public ResponseEntity<SessionResponse> createSession(@Valid @RequestBody SessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.createSession(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật Session")
    public ResponseEntity<SessionResponse> updateSession(
            @PathVariable UUID id,
            @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(sessionService.updateSession(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa Session")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết Session")
    public ResponseEntity<SessionResponse> getSessionById(@PathVariable UUID id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @GetMapping("/lesson/{lessonId}")
    @Operation(summary = "Lấy danh sách Session theo Lesson")
    public ResponseEntity<List<SessionResponse>> getSessionsByLesson(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(sessionService.getSessionsByLesson(lessonId));
    }
}