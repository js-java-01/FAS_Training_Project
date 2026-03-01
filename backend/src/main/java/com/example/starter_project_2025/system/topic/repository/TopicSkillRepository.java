package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.skill.entity.Skill;
import com.example.starter_project_2025.system.topic.entity.TopicSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TopicSkillRepository extends JpaRepository<TopicSkill, UUID> {

    List<TopicSkill> findByTopicId(UUID topicId);

    void deleteByTopicId(UUID topicId);

    @Query("""
        SELECT s FROM Skill s
        WHERE s.id NOT IN (
            SELECT ts.skill.id FROM TopicSkill ts WHERE ts.topic.id = :topicId
        )
        AND (:groupId IS NULL OR s.group.id = :groupId)
        AND (:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    List<Skill> findAvailableSkills(UUID topicId, UUID groupId, String keyword);
}
