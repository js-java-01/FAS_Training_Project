package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.TopicUpdateRequest;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.mapper.TopicMapper;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
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
        // Business Rule: Code must be unique
        if (topicRepository.existsByCode(req.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic code already exists: " + req.getCode());
        }

        Topic topic = mapper.toEntity(req);
        topic.setStatus("DRAFT");  // Mặc định theo SRS
        topic.setVersion("v1.0");  // Mặc định phiên bản đầu tiên

        // Nếu project có BaseEntity để lưu người tạo:
        // topic.setCreator(userService.getCurrentUser());

        return mapper.toResponse(topicRepository.save(topic));
    }

    @Override
    public TopicResponse update(UUID id, TopicUpdateRequest req) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        if (req.getName() != null) topic.setName(req.getName());
        if (req.getLevel() != null) topic.setLevel(req.getLevel());
        if (req.getDescription() != null) topic.setDescription(req.getDescription());
        if (req.getStatus() != null) topic.setStatus(req.getStatus());

        // topic.setUpdater(userService.getCurrentUser());

        return mapper.toResponse(topicRepository.save(topic));
    }

    @Override
    public TopicResponse getById(UUID id) {
        return mapper.toResponse(topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found")));
    }

    @Override
    public Page<TopicResponse> getAll(String keyword, String level, String status, Pageable pageable) {
        // Xử lý giá trị filter từ frontend (ví dụ: "All Levels" -> null)
        String kw = (keyword != null && !keyword.isBlank()) ? keyword : null;
        String lv = (level != null && !level.isBlank() && !level.equalsIgnoreCase("All Levels")) ? level : null;
        String st = (status != null && !status.isBlank() && !status.equalsIgnoreCase("All Status")) ? status : null;

        return topicRepository.findAllByFilters(kw, lv, st, pageable).map(mapper::toResponse);
    }

    @Override
    public void delete(UUID id) {
        // Business Rule: Cần kiểm tra xem topic có đang được sử dụng ở Course nào không trước khi xóa
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

            // Style cho Header
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Tạo Header Row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Đổ dữ liệu
            int rowIdx = 1;
            for (Topic t : topics) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(t.getName() != null ? t.getName() : "");
                row.createCell(1).setCellValue(t.getCode() != null ? t.getCode() : "");
                row.createCell(2).setCellValue(t.getLevel() != null ? t.getLevel() : "");
                row.createCell(3).setCellValue(t.getStatus() != null ? t.getStatus() : "");
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
            Sheet sheet = workbook.createSheet("Topic Import Template");

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            // Sample data row
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("Spring Security");
            sampleRow.createCell(1).setCellValue("TOPIC-SEC-01");
            sampleRow.createCell(2).setCellValue("INTERMEDIATE");
            sampleRow.createCell(3).setCellValue("Advanced security patterns for Java applications");

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

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = getCellValue(row.getCell(0));
                String code = getCellValue(row.getCell(1));

                if (name.isBlank() || code.isBlank() || topicRepository.existsByCode(code)) {
                    continue; // Bỏ qua nếu dữ liệu trống hoặc mã đã tồn tại
                }

                Topic topic = new Topic();
                topic.setName(name);
                topic.setCode(code);
                topic.setLevel(getCellValue(row.getCell(2)));
                topic.setDescription(getCellValue(row.getCell(3)));
                topic.setStatus("DRAFT");
                topic.setVersion("v1.0");

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