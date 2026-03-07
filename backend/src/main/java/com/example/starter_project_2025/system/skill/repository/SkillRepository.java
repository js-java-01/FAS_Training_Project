package com.example.starter_project_2025.system.skill.repository;

import com.example.starter_project_2025.system.skill.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    boolean existsByCode(String code);

    @Query("""
        SELECT s FROM Skill s
        WHERE (:groupId IS NULL OR s.group.id = :groupId)
        AND (:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    List<Skill> search(UUID groupId, String keyword);
}
