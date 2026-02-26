package com.example.starter_project_2025.system.course.mapper;

import com.example.starter_project_2025.system.course.dto.LessonBatchItem;
import com.example.starter_project_2025.system.course.dto.SessionBatchItem;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.entity.CourseLesson;
import com.example.starter_project_2025.system.course.entity.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BatchOutlineMapper {

        public CourseLesson toLesson(LessonBatchItem dto, Course course, int order) {
                return CourseLesson.builder()
                                .lessonName(dto.getLessonName())
                                .description(dto.getDescription())
                                .duration(dto.getDuration())
                                .course(course)
                                .sortOrder(dto.getOrder() != null ? dto.getOrder() : order)
                                .build();
        }

        public Session toSession(
                        SessionBatchItem dto,
                        CourseLesson lesson,
                        int order) {
                return Session.builder()
                                .type(dto.getType())
                                .topic(dto.getTopic())
                                .studentTasks(dto.getStudentTasks())
                                .lesson(lesson)
                                .sessionOrder(
                                                dto.getSessionOrder() != null
                                                                ? dto.getSessionOrder()
                                                                : order)
                                .build();
        }
}
