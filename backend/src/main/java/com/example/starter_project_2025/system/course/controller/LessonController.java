package com.example.starter_project_2025.system.course.controller;

import com.example.starter_project_2025.system.course.dto.LessonCreateRequest;
import com.example.starter_project_2025.system.course.dto.LessonResponse;
import com.example.starter_project_2025.system.course.dto.LessonUpdateRequest;
import com.example.starter_project_2025.system.course.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {
    private final LessonService lessonService;

    @PostMapping
    public LessonResponse create(@RequestBody LessonCreateRequest request) {
        return lessonService.create(request);
    }

    @PutMapping("/{id}")
    public LessonResponse update(@PathVariable UUID id, @RequestBody LessonUpdateRequest request) {
        return lessonService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        lessonService.delete(id);
    }

    @GetMapping("/course/{courseId}")
    public List<LessonResponse> getByCourseId(@PathVariable UUID courseId) {
        return lessonService.getByCourseId(courseId);
    }
}