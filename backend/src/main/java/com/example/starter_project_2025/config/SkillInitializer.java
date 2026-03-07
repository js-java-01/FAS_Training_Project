package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.skill.entity.Skill;
import com.example.starter_project_2025.system.skill.entity.SkillGroup;
import com.example.starter_project_2025.system.skill.repository.SkillGroupRepository;
import com.example.starter_project_2025.system.skill.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillInitializer {

    private final SkillGroupRepository skillGroupRepository;
    private final SkillRepository skillRepository;

    public void init() {
        if (skillGroupRepository.count() > 0)
            return;

        // ── Skill Groups ──────────────────────────────────────────
        SkillGroup technical = skillGroupRepository.save(
                SkillGroup.builder().name("Technical Skills").code("TECH").build());

        SkillGroup soft = skillGroupRepository.save(
                SkillGroup.builder().name("Soft Skills").code("SOFT").build());

        SkillGroup lang = skillGroupRepository.save(
                SkillGroup.builder().name("Programming Languages").code("LANG").build());

        SkillGroup db = skillGroupRepository.save(
                SkillGroup.builder().name("Database").code("DB").build());

        // ── Skills ────────────────────────────────────────────────
        skillRepository.saveAll(List.of(
                // Technical
                Skill.builder().name("React").code("REACT").group(technical)
                        .description("React.js UI library for building interactive frontends").build(),
                Skill.builder().name("Spring Boot").code("SPRING_BOOT").group(technical)
                        .description("Java Spring Boot backend framework").build(),
                Skill.builder().name("REST API Design").code("REST_API").group(technical)
                        .description("Design and implementation of RESTful services").build(),
                Skill.builder().name("Docker").code("DOCKER").group(technical)
                        .description("Containerization using Docker").build(),

                // Soft
                Skill.builder().name("Communication").code("COMM").group(soft)
                        .description("Verbal and written communication skills").build(),
                Skill.builder().name("Teamwork").code("TEAMWORK").group(soft)
                        .description("Working effectively in a team environment").build(),
                Skill.builder().name("Problem Solving").code("PROB_SOLVE").group(soft)
                        .description("Analytical thinking and problem resolution").build(),

                // Programming Languages
                Skill.builder().name("Java").code("JAVA").group(lang)
                        .description("Java programming language").build(),
                Skill.builder().name("JavaScript").code("JS").group(lang)
                        .description("JavaScript / TypeScript").build(),
                Skill.builder().name("Python").code("PYTHON").group(lang)
                        .description("Python programming language").build(),

                // Database
                Skill.builder().name("PostgreSQL").code("POSTGRES").group(db)
                        .description("Relational database management with PostgreSQL").build(),
                Skill.builder().name("MySQL").code("MYSQL").group(db)
                        .description("Relational database management with MySQL").build(),
                Skill.builder().name("Redis").code("REDIS").group(db)
                        .description("In-memory data structure store").build()));
    }
}
