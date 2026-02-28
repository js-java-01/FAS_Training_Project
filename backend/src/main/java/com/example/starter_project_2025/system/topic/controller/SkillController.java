package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.CreateSkillGroupRequest;
import com.example.starter_project_2025.system.topic.dto.CreateSkillRequest;
import com.example.starter_project_2025.system.topic.dto.SkillGroupResponse;
import com.example.starter_project_2025.system.topic.dto.SkillResponse;
import com.example.starter_project_2025.system.topic.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    // ─── Skills ───────────────────────────────────────────

    @PostMapping
    public SkillResponse create(@RequestBody CreateSkillRequest request) {
        return skillService.create(request);
    }

    @GetMapping
    public List<SkillResponse> search(
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) String keyword) {
        return skillService.search(groupId, keyword);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable UUID id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Skill Groups ─────────────────────────────────────

    @PostMapping("/groups")
    public SkillGroupResponse createGroup(@RequestBody CreateSkillGroupRequest request) {
        return skillService.createGroup(request);
    }

    @GetMapping("/groups")
    public List<SkillGroupResponse> getGroups() {
        return skillService.getAllGroups();
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable UUID id) {
        skillService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
}
