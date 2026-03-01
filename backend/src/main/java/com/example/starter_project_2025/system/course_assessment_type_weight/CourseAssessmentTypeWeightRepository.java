package com.example.starter_project_2025.system.course_assessment_type_weight;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseAssessmentTypeWeightRepository extends JpaRepository<CourseAssessmentTypeWeight, UUID> {

    List<CourseAssessmentTypeWeight> findByCourseId(UUID courseId);

    Optional<CourseAssessmentTypeWeight> findByCourseIdAndAssessmentTypeId(UUID courseId, String assessmentTypeId);
}
