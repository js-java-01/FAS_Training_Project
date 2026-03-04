package com.example.starter_project_2025.system.course_online.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.starter_project_2025.system.course_online.dto.LessonCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.LessonOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.LessonUpdateOnlineRequest;
import com.example.starter_project_2025.system.course_online.service.LessonOnlineService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonOnlineController {
    private final LessonOnlineService lessonService;

    @PostMapping
    public LessonOnlineResponse create(@RequestBody LessonCreateOnlineRequest request) {
        return lessonService.create(request);
    }

    @PutMapping("/{id}")
    public LessonOnlineResponse update(@PathVariable UUID id, @RequestBody LessonUpdateOnlineRequest request) {
        return lessonService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        lessonService.delete(id);
    }

    @GetMapping("/course/{courseId}")
    public List<LessonOnlineResponse> getByCourseId(@PathVariable UUID courseId) {
        return lessonService.getByCourseId(courseId);
    }
}