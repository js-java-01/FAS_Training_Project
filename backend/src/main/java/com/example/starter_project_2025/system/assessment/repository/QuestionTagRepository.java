package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.system.assessment.dto.question_tag.response.TagCountResponse;
import com.example.starter_project_2025.system.assessment.entity.QuestionTag;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionTagRepository extends BaseCrudRepository<QuestionTag, Long> {

    boolean existsByNameIgnoreCase(String name);

    @Query("""
       SELECT new com.example.starter_project_2025.system.assessment.dto.question_tag.response.TagCountResponse(
           t.id,
           t.name,
           COUNT(q.id)
       )
       FROM Question q
       JOIN q.tags t
       WHERE q.category.id = :categoryId
       GROUP BY t.id, t.name
       ORDER BY COUNT(q.id) DESC, t.name ASC
       """)
    List<TagCountResponse> findTagsByCategoryWithCount(UUID categoryId);


}

