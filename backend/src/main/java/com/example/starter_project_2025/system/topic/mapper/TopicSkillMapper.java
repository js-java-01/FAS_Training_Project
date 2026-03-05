package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.skill.dto.SkillResponse;
import com.example.starter_project_2025.system.topic.dto.TopicSkillResponse;
import com.example.starter_project_2025.system.skill.entity.Skill;
import com.example.starter_project_2025.system.topic.entity.TopicSkill;
import org.springframework.stereotype.Component;

@Component
public class TopicSkillMapper {

    public TopicSkillResponse toResponse(TopicSkill entity) {
        TopicSkillResponse dto = new TopicSkillResponse();

        dto.setTopicSkillId(entity.getId());
        dto.setSkillId(entity.getSkill().getId());
        dto.setSkillName(entity.getSkill().getName());
        dto.setCode(entity.getSkill().getCode());
        dto.setGroupName(entity.getSkill().getGroup().getName());
        dto.setDescription(entity.getSkill().getDescription());
        dto.setRequired(entity.isRequired());

        return dto;
    }

    public SkillResponse toSkillResponse(Skill skill) {
        SkillResponse dto = new SkillResponse();

        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setCode(skill.getCode());
        dto.setGroupName(skill.getGroup().getName());
        dto.setDescription(skill.getDescription());

        return dto;
    }
}
