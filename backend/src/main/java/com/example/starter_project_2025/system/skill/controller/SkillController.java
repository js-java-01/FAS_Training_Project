package com.example.starter_project_2025.system.skill.controller;

import com.example.starter_project_2025.system.skill.dto.CreateSkillGroupRequest;
import com.example.starter_project_2025.system.skill.dto.CreateSkillRequest;
import com.example.starter_project_2025.system.skill.dto.SkillGroupResponse;
import com.example.starter_project_2025.system.skill.dto.SkillResponse;
import com.example.starter_project_2025.system.skill.service.SkillService;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    // ─── Combined Export / Import / Template (Skills + Groups) ────────────

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportAll() throws IOException {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=skills_export.xlsx")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(skillService.exportAll()));
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultResponse> importAll(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(skillService.importAll(file));
    }

    @GetMapping("/template")
    public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=skills_template.xlsx")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(skillService.downloadTemplate()));
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

    @GetMapping("/groups/export")
    public ResponseEntity<InputStreamResource> exportGroups() throws IOException {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=skill_groups_export.xlsx")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(skillService.exportGroups()));
    }

    @PostMapping("/groups/import")
    public ResponseEntity<ImportResultResponse> importGroups(@RequestParam("file") MultipartFile file)
            throws IOException {
        return ResponseEntity.ok(skillService.importGroups(file));
    }

    @GetMapping("/groups/template")
    public ResponseEntity<InputStreamResource> downloadGroupTemplate() throws IOException {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=skill_groups_template.xlsx")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(skillService.downloadGroupTemplate()));
    }
}
