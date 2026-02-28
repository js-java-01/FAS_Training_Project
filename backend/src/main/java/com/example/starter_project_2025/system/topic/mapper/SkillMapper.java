package com.example.starter_project_2025.system.topic.mapper;

import com.example.starter_project_2025.system.topic.dto.SkillResponse;
import com.example.starter_project_2025.system.topic.entity.Skill;
import org.springframework.stereotype.Component;

@Component
public class SkillMapper {

    public SkillResponse toResponse(Skill skill) {

        SkillResponse dto = new SkillResponse();

        dto.setId(skill.getId());
        dto.setCode(skill.getCode());
        dto.setName(skill.getName());
        dto.setDescription(skill.getDescription());
        dto.setGroupName(skill.getGroup().getName());

        return dto;
    }
}
