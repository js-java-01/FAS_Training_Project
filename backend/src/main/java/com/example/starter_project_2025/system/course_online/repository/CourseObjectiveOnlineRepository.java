package com.example.starter_project_2025.system.course_online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.starter_project_2025.system.course_online.entity.CourseObjectiveOnline;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseObjectiveOnlineRepository
        extends JpaRepository<CourseObjectiveOnline, UUID> {

    boolean existsByCourseIdAndName(UUID courseId, String name);

    List<CourseObjectiveOnline> findByCourseId(UUID courseId);

    boolean existsByCourseIdAndNameAndIdNot(
            UUID courseId,
            String name,
            UUID objectiveId
    );

    boolean existsByCourseIdAndCode(UUID courseId, String code);

    boolean existsByCourseIdAndCodeAndIdNot(
            UUID courseId,
            String code,
            UUID objectiveId
    );

    List<CourseObjectiveOnline> findByCourse_Id(UUID courseId);
}
