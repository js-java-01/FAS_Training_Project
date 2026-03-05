package com.example.starter_project_2025.system.skill.repository;

import com.example.starter_project_2025.system.skill.entity.SkillGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillGroupRepository extends JpaRepository<SkillGroup, UUID> {
    boolean existsByCode(String code);

    boolean existsByName(String name);

    Optional<SkillGroup> findByCode(String code);
}
