package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.course_online.dto.LessonCreateRequest;
import com.example.starter_project_2025.system.course_online.dto.LessonResponse;
import com.example.starter_project_2025.system.course_online.dto.LessonUpdateRequest;
import com.example.starter_project_2025.system.course_online.entity.Course;
import com.example.starter_project_2025.system.course_online.entity.CourseLesson;
import com.example.starter_project_2025.system.course_online.mapper.LessonMapper;
import com.example.starter_project_2025.system.course_online.repository.CourseLessonRepository;
import com.example.starter_project_2025.system.course_online.repository.CourseRepository;
import com.example.starter_project_2025.system.course_online.repository.SessionRepository;
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
    private final SessionRepository sessionRepository;

    @Override
    public LessonResponse create(LessonCreateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        CourseLesson lesson = lessonMapper.toEntity(request);
        lesson.setCourse(course);
        CourseLesson saved = lessonRepository.save(lesson);
        return lessonMapper.toResponse(saved, 0);
    }

    @Override
    public LessonResponse update(UUID id, LessonUpdateRequest request) {
        CourseLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (request.getLessonName() != null) lesson.setLessonName(request.getLessonName());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        CourseLesson saved = lessonRepository.save(lesson);
        Integer computed = sessionRepository.sumDurationByLessonId(saved.getId());
        return lessonMapper.toResponse(saved, computed != null ? computed : 0);
    }

    @Override
    public void delete(UUID id) {
        lessonRepository.deleteById(id);
    }

    @Override
    public List<LessonResponse> getByCourseId(UUID courseId) {
        return lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId)
                .stream()
                .map(lesson -> {
                    Integer computed = sessionRepository.sumDurationByLessonId(lesson.getId());
                    return lessonMapper.toResponse(lesson, computed != null ? computed : 0);
                })
                .toList();
    }
}