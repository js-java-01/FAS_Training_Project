package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.CreateSkillGroupRequest;
import com.example.starter_project_2025.system.topic.dto.CreateSkillRequest;
import com.example.starter_project_2025.system.topic.dto.SkillGroupResponse;
import com.example.starter_project_2025.system.topic.dto.SkillResponse;
import com.example.starter_project_2025.system.topic.entity.Skill;
import com.example.starter_project_2025.system.topic.entity.SkillGroup;
import com.example.starter_project_2025.system.topic.mapper.SkillMapper;
import com.example.starter_project_2025.system.topic.repository.SkillGroupRepository;
import com.example.starter_project_2025.system.topic.repository.SkillRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final SkillGroupRepository groupRepository;
    private final SkillMapper mapper;

    // ─── Skill ───────────────────────────────────────────

    @Override
    public SkillResponse create(CreateSkillRequest request) {
        if (skillRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Skill code already exists");
        }
        SkillGroup group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Skill group not found"));
        Skill skill = Skill.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .group(group)
                .build();
        skillRepository.save(skill);
        return mapper.toResponse(skill);
    }

    @Override
    public List<SkillResponse> search(UUID groupId, String keyword) {
        return skillRepository.search(groupId, keyword)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public void deleteSkill(UUID id) {
        if (!skillRepository.existsById(id)) {
            throw new RuntimeException("Skill not found");
        }
        skillRepository.deleteById(id);
    }

    // ─── SkillGroup ───────────────────────────────────────

    @Override
    public SkillGroupResponse createGroup(CreateSkillGroupRequest request) {
        if (groupRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Skill group code already exists");
        }
        SkillGroup group = SkillGroup.builder()
                .name(request.getName())
                .code(request.getCode())
                .build();
        groupRepository.save(group);
        return toGroupResponse(group);
    }

    @Override
    public List<SkillGroupResponse> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::toGroupResponse)
                .toList();
    }

    @Override
    public void deleteGroup(UUID id) {
        SkillGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill group not found"));
        if (group.getSkills() != null && !group.getSkills().isEmpty()) {
            throw new RuntimeException("Cannot delete group that still has skills");
        }
        groupRepository.deleteById(id);
    }

    // ─── Helper ───────────────────────────────────────────

    private SkillGroupResponse toGroupResponse(SkillGroup group) {
        SkillGroupResponse dto = new SkillGroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setCode(group.getCode());
        dto.setSkillCount(group.getSkills() == null ? 0 : group.getSkills().size());
        return dto;
    }
}
