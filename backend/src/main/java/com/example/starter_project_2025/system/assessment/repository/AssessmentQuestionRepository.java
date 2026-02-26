package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, UUID> {
    // Sau này cần tìm câu hỏi trong 1 đề thi thì viết hàm findByAssessmentId ở đây

    @Query("""
                SELECT DISTINCT aq
                FROM AssessmentQuestion aq
                JOIN FETCH aq.question q
                LEFT JOIN FETCH q.category
                LEFT JOIN FETCH q.options
                WHERE aq.assessment.id = :assessmentId
                ORDER BY aq.orderIndex
            """)
    List<AssessmentQuestion> findByAssessmentId(@Param("assessmentId") Long assessmentId);

}