package com.example.starter_project_2025.system.skill.service;

import com.example.starter_project_2025.system.skill.dto.CreateSkillGroupRequest;
import com.example.starter_project_2025.system.skill.dto.CreateSkillRequest;
import com.example.starter_project_2025.system.skill.dto.SkillGroupResponse;
import com.example.starter_project_2025.system.skill.dto.SkillResponse;
import com.example.starter_project_2025.system.skill.dto.UpdateSkillRequest;
import com.example.starter_project_2025.system.skill.dto.UpdateSkillGroupRequest;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface SkillService {

    // Skill CRUD
    SkillResponse create(CreateSkillRequest request);

    List<SkillResponse> search(UUID groupId, String keyword);

    SkillResponse updateSkill(UUID id, UpdateSkillRequest request);

    void deleteSkill(UUID id);

    // SkillGroup CRUD
    SkillGroupResponse createGroup(CreateSkillGroupRequest request);

    List<SkillGroupResponse> getAllGroups();

    SkillGroupResponse updateGroup(UUID id, UpdateSkillGroupRequest request);

    void deleteGroup(UUID id);

    // Combined Import / Export (Skills + Groups in one file)
    ByteArrayInputStream exportAll() throws IOException;

    ImportResultResponse importAll(MultipartFile file);

    ByteArrayInputStream downloadTemplate() throws IOException;

    // Separate Group Import / Export
    ByteArrayInputStream exportGroups() throws IOException;

    ImportResultResponse importGroups(MultipartFile file);

    ByteArrayInputStream downloadGroupTemplate() throws IOException;
}
