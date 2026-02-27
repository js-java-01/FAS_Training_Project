package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID>, JpaSpecificationExecutor<Question> {
    @Query("""
       SELECT q
       FROM Question q
       JOIN q.tags t
       WHERE q.category.id = :categoryId
         AND t.id IN :tagIds
       GROUP BY q
       HAVING COUNT(DISTINCT t.id) = :tagCount
       """)
    Page<Question> findByCategoryAndAllTags(
            UUID categoryId,
            List<Long> tagIds,
            long tagCount,
            Pageable pageable
    );
}