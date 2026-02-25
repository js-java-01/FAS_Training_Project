package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.LessonCreateRequest;
import com.example.starter_project_2025.system.course.dto.LessonResponse;
import com.example.starter_project_2025.system.course.dto.LessonUpdateRequest;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseLesson;
import com.example.starter_project_2025.system.course.mapper.LessonMapper;
import com.example.starter_project_2025.system.course.repository.CourseLessonRepository;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {
    private final CourseLessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final LessonMapper lessonMapper;

    @Override
    public LessonResponse create(LessonCreateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        CourseLesson lesson = lessonMapper.toEntity(request);
        lesson.setCourse(course);
        return lessonMapper.toResponse(lessonRepository.save(lesson));
    }

    @Override
    public LessonResponse update(UUID id, LessonUpdateRequest request) {
        CourseLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (request.getLessonName() != null) lesson.setLessonName(request.getLessonName());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        return lessonMapper.toResponse(lessonRepository.save(lesson));
    }

    @Override
    public void delete(UUID id) {
        lessonRepository.deleteById(id);
    }

    @Override
    public List<LessonResponse> getByCourseId(UUID courseId) {
        return lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId)
                .stream().map(lessonMapper::toResponse).toList();
    }
}