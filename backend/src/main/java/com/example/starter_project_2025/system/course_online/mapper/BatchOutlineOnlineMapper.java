package com.example.starter_project_2025.system.course_online.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.example.starter_project_2025.system.course_online.dto.LessonBatchOnlineItem;
import com.example.starter_project_2025.system.course_online.dto.SessionBatchOnlineItem;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.entity.CourseLessonOnline;
import com.example.starter_project_2025.system.course_online.entity.SessionOnline;

@Component
@RequiredArgsConstructor
public class BatchOutlineOnlineMapper {

        public CourseLessonOnline toLesson(LessonBatchOnlineItem dto, CourseOnline course, int order) {
                return CourseLessonOnline.builder()
                                .lessonName(dto.getLessonName())
                                .description(dto.getDescription())
                                .duration(dto.getDuration())
                                .course(course)
                                .sortOrder(dto.getOrder() != null ? dto.getOrder() : order)
                                .build();
        }

        public SessionOnline toSession(
                        SessionBatchOnlineItem dto,
                        CourseLessonOnline lesson,
                        int order) {
                return SessionOnline.builder()
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
