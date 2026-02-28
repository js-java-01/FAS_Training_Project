package com.example.starter_project_2025.system.assessment.repository;

import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagCountResponse;
import com.example.starter_project_2025.system.assessment.entity.Question;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);

    @Query("""
       SELECT new com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagCountResponse(
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

    Tag findByName(String name);



}

