package com.example.starter_project_2025.system.topic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

import com.example.starter_project_2025.system.skill.entity.Skill;

@Entity
@Table(name = "topic_skills",
        uniqueConstraints = @UniqueConstraint(columnNames = {"topic_id", "skill_id"}))
@Getter
@Setter
public class TopicSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    private boolean required;
}
