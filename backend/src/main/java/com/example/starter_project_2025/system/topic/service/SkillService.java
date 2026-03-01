package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.CreateSkillGroupRequest;
import com.example.starter_project_2025.system.topic.dto.CreateSkillRequest;
import com.example.starter_project_2025.system.topic.dto.SkillGroupResponse;
import com.example.starter_project_2025.system.topic.dto.SkillResponse;
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

    void deleteSkill(UUID id);

    // SkillGroup CRUD
    SkillGroupResponse createGroup(CreateSkillGroupRequest request);

    List<SkillGroupResponse> getAllGroups();

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
