package com.example.starter_project_2025.system.course_online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.starter_project_2025.system.course_online.dto.LessonCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.LessonOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.LessonUpdateOnlineRequest;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.entity.CourseLessonOnline;
import com.example.starter_project_2025.system.course_online.mapper.LessonOnlineMapper;
import com.example.starter_project_2025.system.course_online.repository.CourseLessonOnlineRepository;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.course_online.repository.SessionOnlineRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonOnlineServiceImpl implements LessonOnlineService {
    private final CourseLessonOnlineRepository lessonRepository;
    private final CourseOnlineRepository courseRepository;
    private final LessonOnlineMapper lessonMapper;
    private final SessionOnlineRepository sessionRepository;

    @Override
    public LessonOnlineResponse create(LessonCreateOnlineRequest request) {
        CourseOnline course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("CourseOnline not found"));
        CourseLessonOnline lesson = lessonMapper.toEntity(request);
        lesson.setCourse(course);
        CourseLessonOnline saved = lessonRepository.save(lesson);
        return lessonMapper.toResponse(saved, 0);
    }

    @Override
    public LessonOnlineResponse update(UUID id, LessonUpdateOnlineRequest request) {
        CourseLessonOnline lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (request.getLessonName() != null) lesson.setLessonName(request.getLessonName());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        CourseLessonOnline saved = lessonRepository.save(lesson);
        Integer computed = sessionRepository.sumDurationByLessonId(saved.getId());
        return lessonMapper.toResponse(saved, computed != null ? computed : 0);
    }

    @Override
    public void delete(UUID id) {
        lessonRepository.deleteById(id);
    }

    @Override
    public List<LessonOnlineResponse> getByCourseId(UUID courseId) {
        return lessonRepository.findByCourseIdOrderBySortOrderAsc(courseId)
                .stream()
                .map(lesson -> {
                    Integer computed = sessionRepository.sumDurationByLessonId(lesson.getId());
                    return lessonMapper.toResponse(lesson, computed != null ? computed : 0);
                })
                .toList();
    }
}