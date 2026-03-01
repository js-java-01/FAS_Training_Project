package com.example.starter_project_2025.system.skill.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.skill.dto.CreateSkillGroupRequest;
import com.example.starter_project_2025.system.skill.dto.CreateSkillRequest;
import com.example.starter_project_2025.system.skill.dto.SkillGroupResponse;
import com.example.starter_project_2025.system.skill.dto.SkillResponse;
import com.example.starter_project_2025.system.skill.entity.Skill;
import com.example.starter_project_2025.system.skill.entity.SkillGroup;
import com.example.starter_project_2025.system.skill.mapper.SkillMapper;
import com.example.starter_project_2025.system.skill.repository.SkillGroupRepository;
import com.example.starter_project_2025.system.skill.repository.SkillRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private CellStyle buildHeaderStyle(Workbook workbook) {
        Font bold = workbook.createFont();
        bold.setBold(true);
        CellStyle style = workbook.createCellStyle();
        style.setFont(bold);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    // ─── Combined Export (Groups + Skills, two sheets) ────────────────────

    @Override
    public ByteArrayInputStream exportAll() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle headerStyle = buildHeaderStyle(workbook);

            // Sheet 0: Skill Groups
            String[] groupCols = { "Group Name", "Group Code" };
            Sheet groupSheet = workbook.createSheet("Skill Groups");
            Row groupHeader = groupSheet.createRow(0);
            for (int i = 0; i < groupCols.length; i++) {
                Cell c = groupHeader.createCell(i);
                c.setCellValue(groupCols[i]);
                c.setCellStyle(headerStyle);
            }
            int gi = 1;
            for (SkillGroup g : groupRepository.findAll()) {
                Row row = groupSheet.createRow(gi++);
                row.createCell(0).setCellValue(g.getName() != null ? g.getName() : "");
                row.createCell(1).setCellValue(g.getCode() != null ? g.getCode() : "");
            }
            for (int i = 0; i < groupCols.length; i++)
                groupSheet.autoSizeColumn(i);

            // Sheet 1: Skills
            String[] skillCols = { "Skill Name", "Code", "Group Code", "Description" };
            Sheet skillSheet = workbook.createSheet("Skills");
            Row skillHeader = skillSheet.createRow(0);
            for (int i = 0; i < skillCols.length; i++) {
                Cell c = skillHeader.createCell(i);
                c.setCellValue(skillCols[i]);
                c.setCellStyle(headerStyle);
            }
            int si = 1;
            for (Skill s : skillRepository.findAll()) {
                Row row = skillSheet.createRow(si++);
                row.createCell(0).setCellValue(s.getName() != null ? s.getName() : "");
                row.createCell(1).setCellValue(s.getCode() != null ? s.getCode() : "");
                row.createCell(2).setCellValue(
                        s.getGroup() != null && s.getGroup().getCode() != null ? s.getGroup().getCode() : "");
                row.createCell(3).setCellValue(s.getDescription() != null ? s.getDescription() : "");
            }
            for (int i = 0; i < skillCols.length; i++)
                skillSheet.autoSizeColumn(i);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ─── Combined Import (Sheet 0 = Groups, Sheet 1 = Skills) ────────────

    @Override
    public ImportResultResponse importAll(MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            // Import groups first (Sheet 0)
            if (workbook.getNumberOfSheets() > 0) {
                Sheet groupSheet = workbook.getSheetAt(0);
                for (int i = 1; i <= groupSheet.getLastRowNum(); i++) {
                    Row row = groupSheet.getRow(i);
                    if (row == null)
                        continue;
                    result.setTotalRows(result.getTotalRows() + 1);
                    int displayRow = i + 1;
                    try {
                        String name = getCellValue(row.getCell(0));
                        String code = getCellValue(row.getCell(1));
                        if (name.isBlank() || code.isBlank()) {
                            result.addError(displayRow, "groupName/groupCode", "Name and code are required");
                            continue;
                        }
                        if (groupRepository.existsByCode(code)) {
                            result.addError(displayRow, "groupCode", "Group code already exists: " + code);
                            continue;
                        }
                        groupRepository.save(SkillGroup.builder().name(name).code(code).build());
                        result.addSuccess();
                    } catch (Exception e) {
                        result.addError(displayRow, "", e.getMessage());
                    }
                }
            }

            // Import skills (Sheet 1)
            if (workbook.getNumberOfSheets() > 1) {
                Sheet skillSheet = workbook.getSheetAt(1);
                for (int i = 1; i <= skillSheet.getLastRowNum(); i++) {
                    Row row = skillSheet.getRow(i);
                    if (row == null)
                        continue;
                    result.setTotalRows(result.getTotalRows() + 1);
                    int displayRow = i + 1;
                    try {
                        String name = getCellValue(row.getCell(0));
                        String code = getCellValue(row.getCell(1));
                        String groupCode = getCellValue(row.getCell(2));
                        String description = getCellValue(row.getCell(3));
                        if (name.isBlank() || code.isBlank()) {
                            result.addError(displayRow, "name/code", "Skill name and code are required");
                            continue;
                        }
                        if (skillRepository.existsByCode(code)) {
                            result.addError(displayRow, "code", "Skill code already exists: " + code);
                            continue;
                        }
                        SkillGroup group = groupRepository.findByCode(groupCode)
                                .orElse(null);
                        if (group == null) {
                            result.addError(displayRow, "groupCode", "Skill group code not found: " + groupCode);
                            continue;
                        }
                        skillRepository.save(Skill.builder()
                                .name(name).code(code)
                                .description(description.isBlank() ? null : description)
                                .group(group).build());
                        result.addSuccess();
                    } catch (Exception e) {
                        result.addError(displayRow, "", e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            result.addError(0, "file", "File error: " + e.getMessage());
        }
        result.buildMessage();
        return result;
    }

    // ─── Combined Template ────────────────────────────────────────────────

    @Override
    public ByteArrayInputStream downloadTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);

            // Sheet 0: Skill Groups template
            Sheet groupSheet = workbook.createSheet("Skill Groups");
            String[] groupCols = { "Group Name", "Group Code" };
            Row groupHeader = groupSheet.createRow(0);
            for (int i = 0; i < groupCols.length; i++) {
                Cell c = groupHeader.createCell(i);
                c.setCellValue(groupCols[i]);
                c.setCellStyle(headerStyle);
            }
            Row groupSample = groupSheet.createRow(1);
            groupSample.createCell(0).setCellValue("Backend Development");
            groupSample.createCell(1).setCellValue("GRP-BACKEND");
            for (int i = 0; i < groupCols.length; i++)
                groupSheet.autoSizeColumn(i);

            // Sheet 1: Skills template
            Sheet skillSheet = workbook.createSheet("Skills");
            String[] skillCols = { "Skill Name", "Code", "Group Code", "Description" };
            Row skillHeader = skillSheet.createRow(0);
            for (int i = 0; i < skillCols.length; i++) {
                Cell c = skillHeader.createCell(i);
                c.setCellValue(skillCols[i]);
                c.setCellStyle(headerStyle);
            }
            Row skillSample = skillSheet.createRow(1);
            skillSample.createCell(0).setCellValue("Java Core");
            skillSample.createCell(1).setCellValue("SK-JAVA-01");
            skillSample.createCell(2).setCellValue("GRP-BACKEND");
            skillSample.createCell(3).setCellValue("Core Java programming skills");
            for (int i = 0; i < skillCols.length; i++)
                skillSheet.autoSizeColumn(i);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ─── Groups-only Export ───────────────────────────────────────────────

    @Override
    public ByteArrayInputStream exportGroups() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle headerStyle = buildHeaderStyle(workbook);
            String[] columns = { "Group Name", "Group Code" };
            Sheet sheet = workbook.createSheet("Skill Groups");
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(columns[i]);
                c.setCellStyle(headerStyle);
            }
            int idx = 1;
            for (SkillGroup g : groupRepository.findAll()) {
                Row row = sheet.createRow(idx++);
                row.createCell(0).setCellValue(g.getName() != null ? g.getName() : "");
                row.createCell(1).setCellValue(g.getCode() != null ? g.getCode() : "");
            }
            for (int i = 0; i < columns.length; i++)
                sheet.autoSizeColumn(i);
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ─── Groups-only Import ───────────────────────────────────────────────

    @Override
    public ImportResultResponse importGroups(MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;
                result.setTotalRows(result.getTotalRows() + 1);
                int displayRow = i + 1;
                try {
                    String name = getCellValue(row.getCell(0));
                    String code = getCellValue(row.getCell(1));
                    if (name.isBlank() || code.isBlank()) {
                        result.addError(displayRow, "name/code", "Group name and code are required");
                        continue;
                    }
                    if (groupRepository.existsByCode(code)) {
                        result.addError(displayRow, "code", "Group code already exists: " + code);
                        continue;
                    }
                    groupRepository.save(SkillGroup.builder().name(name).code(code).build());
                    result.addSuccess();
                } catch (Exception e) {
                    result.addError(displayRow, "", e.getMessage());
                }
            }
        } catch (Exception e) {
            result.addError(0, "file", "File error: " + e.getMessage());
        }
        result.buildMessage();
        return result;
    }

    // ─── Groups-only Template ─────────────────────────────────────────────

    @Override
    public ByteArrayInputStream downloadGroupTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);
            String[] columns = { "Group Name", "Group Code" };
            Sheet sheet = workbook.createSheet("Skill Groups");
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(columns[i]);
                c.setCellStyle(headerStyle);
            }
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("Backend Development");
            sample.createCell(1).setCellValue("GRP-BACKEND");
            for (int i = 0; i < columns.length; i++)
                sheet.autoSizeColumn(i);
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
