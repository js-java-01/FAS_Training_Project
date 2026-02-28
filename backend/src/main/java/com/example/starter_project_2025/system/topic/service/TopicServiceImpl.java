package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.TopicUpdateRequest;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.mapper.TopicMapper;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.service.UserService;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final TopicMapper mapper;
    private final UserService userService;

    @Override
    public TopicResponse create(TopicCreateRequest req) {
        // Sửa thành existsByTopicCode
        if (topicRepository.existsByTopicCode(req.getTopicCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic code already exists: " + req.getTopicCode());
        }

        Topic topic = mapper.toEntity(req);
        topic.setCreator(userService.getCurrentUser());
        return mapper.toResponse(topicRepository.save(topic));
    }

    @Override
    public TopicResponse update(UUID id, TopicUpdateRequest req) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        if (req.getTopicName() != null) topic.setTopicName(req.getTopicName());
        if (req.getLevel() != null) topic.setLevel(req.getLevel());
        if (req.getDescription() != null) topic.setDescription(req.getDescription());
        if (req.getStatus() != null) topic.setStatus(req.getStatus());

        topic.setUpdater(userService.getCurrentUser());
        return mapper.toResponse(topicRepository.save(topic));
    }

    @Override
    public TopicResponse getById(UUID id) {
        return mapper.toResponse(topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found")));
    }

    @Override
    public Page<TopicResponse> getAll(String keyword, String level, String status, Pageable pageable) {
        TopicLevel levelEnum = null;
        if (level != null && !level.isBlank()) {
            try {
                levelEnum = TopicLevel.valueOf(level.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        TopicStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = TopicStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String kw = (keyword != null && !keyword.isBlank()) ? keyword : null;
        return topicRepository.findAllByFilters(kw, levelEnum, statusEnum, pageable).map(mapper::toResponse);
    }

    @Override
    public void delete(UUID id) {
        topicRepository.deleteById(id);
    }

    // ─── EXPORT TOPICS ──────────────────────────────────────────────────────
    @Override
    @PreAuthorize("hasAuthority('TOPIC_EXPORT')")
    public ByteArrayInputStream exportTopics() throws IOException {
        String[] columns = { "Topic Name", "Topic Code", "Level", "Status", "Version", "Description" };
        List<Topic> topics = topicRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Topics");

            // Header Style (Khớp style xanh của Course)
            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Topic t : topics) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(t.getTopicCode() != null ? t.getTopicCode() : "");
                row.createCell(1).setCellValue(t.getTopicCode() != null ? t.getTopicName() : "");
                row.createCell(2).setCellValue(t.getLevel() != null ? t.getLevel().name() : "");
                row.createCell(3).setCellValue(t.getStatus() != null ? t.getStatus().name() : "");
                row.createCell(4).setCellValue(t.getVersion() != null ? t.getVersion() : "");
                row.createCell(5).setCellValue(t.getDescription() != null ? t.getDescription() : "");
            }

            for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ─── DOWNLOAD TEMPLATE ──────────────────────────────────────────────────
    @Override
    public ByteArrayInputStream downloadTemplate() throws IOException {
        String[] columns = { "Topic Name", "Topic Code", "Level", "Description" };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Topic Template");

            Font bold = workbook.createFont();
            bold.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(bold);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample row
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("Java Core Foundation");
            sample.createCell(1).setCellValue("T-JAVA-01");
            sample.createCell(2).setCellValue("BEGINNER");
            sample.createCell(3).setCellValue("Học kiến thức nền tảng Java...");

            for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ─── IMPORT TOPICS ──────────────────────────────────────────────────────
    @Override
    @PreAuthorize("hasAuthority('TOPIC_IMPORT')")
    public void importTopics(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            User currentUser = userService.getCurrentUser();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = getCellValue(row.getCell(0));
                String code = getCellValue(row.getCell(1));

                if (name == null || name.isBlank() || code == null || code.isBlank()) continue;

                if (topicRepository.existsByTopicCode(code)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic code already exists: " + code);
                }

                Topic topic = new Topic();
                topic.setTopicCode(name);
                topic.setTopicCode(code);

                String levelStr = getCellValue(row.getCell(2));
                if (levelStr != null && !levelStr.isBlank()) {
                    try {
                        topic.setLevel(TopicLevel.valueOf(levelStr.trim().toUpperCase()));
                    } catch (IllegalArgumentException ignored) {
                        topic.setLevel(TopicLevel.BEGINNER);
                    }
                }

                topic.setDescription(getCellValue(row.getCell(3)));

                // Mặc định giống logic prePersist nhưng set chủ động ở đây
                topic.setStatus(TopicStatus.DRAFT);
                topic.setVersion("v1.0");
                topic.setCreator(currentUser);

                topicRepository.save(topic);
            }
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}