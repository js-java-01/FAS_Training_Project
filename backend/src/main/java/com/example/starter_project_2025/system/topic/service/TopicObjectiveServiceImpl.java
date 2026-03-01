package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.topic.dto.*;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicObjective;
import com.example.starter_project_2025.system.topic.mapper.TopicObjectiveMapper;
import com.example.starter_project_2025.system.topic.repository.TopicObjectiveRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.user.service.UserService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicObjectiveServiceImpl implements TopicObjectiveService {

    private final TopicRepository topicRepository;
    private final TopicObjectiveRepository objectiveRepository;
    private final TopicObjectiveMapper mapper;
    private final UserService userService;

    @Override
    public TopicObjectiveResponse create(UUID topicId, TopicObjectiveCreateRequest request) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        if (objectiveRepository.existsByCodeAndTopicId(request.getCode(), topicId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Objective code already exists in this topic");
        }

        TopicObjective objective = mapper.toEntity(request);
        objective.setTopic(topic);
        objective.setCreator(userService.getCurrentUser());

        return mapper.toResponse(objectiveRepository.save(objective));
    }

    @Override
    public Page<TopicObjectiveResponse> getByTopic(UUID topicId, Pageable pageable) {

        Page<TopicObjective> page = objectiveRepository.findByTopicId(topicId, pageable);

        return page.map(mapper::toResponse);
    }

    @Override
    public TopicObjectiveResponse update(UUID topicId,
                                         UUID objectiveId,
                                         TopicObjectiveUpdateRequest request) {

        // 1. Check topic tồn tại
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        // 2. Check objective tồn tại & đúng topic
        TopicObjective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Objective not found"));

        if (!objective.getTopic().getId().equals(topicId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Objective does not belong to this topic");
        }

        // 3. Validate unique code
        if (objectiveRepository.existsByCodeAndTopicIdAndIdNot(
                request.getCode(), topicId, objectiveId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Objective code already exists in this topic");
        }

        // 4. Update fields
        objective.setCode(request.getCode());
        objective.setName(request.getName());
        objective.setDetails(request.getDetails());
        objective.setUpdater(userService.getCurrentUser());

        return mapper.toResponse(objectiveRepository.save(objective));
    }

    @Override
    public void delete(UUID topicId, UUID objectiveId) {

        TopicObjective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Objective not found"));

        if (!objective.getTopic().getId().equals(topicId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Objective does not belong to this topic");
        }

        // Nếu sau này có ràng buộc (assessment mapping, etc.)
        // có thể check tại đây

        objectiveRepository.delete(objective);
    }

    @Override
    public ResponseEntity<byte[]> exportObjectives(UUID topicId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));

        List<TopicObjective> objectives =
                objectiveRepository.findByTopicId(topicId, Pageable.unpaged()).getContent();

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Objectives");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Code");
            header.createCell(1).setCellValue("Name");
            header.createCell(2).setCellValue("Details");

            int rowIdx = 1;
            for (TopicObjective obj : objectives) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(obj.getCode());
                row.createCell(1).setCellValue(obj.getName());
                row.createCell(2).setCellValue(obj.getDetails());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=topic-objectives.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to export objectives", e);
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Template");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Code");
            header.createCell(1).setCellValue("Name");
            header.createCell(2).setCellValue("Details");

            Row example = sheet.createRow(1);
            example.createCell(0).setCellValue("CLO-1");
            example.createCell(1).setCellValue("Understand REST API");
            example.createCell(2).setCellValue("Student can explain REST principles");

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=objective-template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to download template", e);
        }
    }

    @Override
    @Transactional
    public void importObjectives(UUID topicId, MultipartFile file) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                String code = row.getCell(0).getStringCellValue().trim();
                String name = row.getCell(1).getStringCellValue().trim();
                String details = row.getCell(2) != null
                        ? row.getCell(2).getStringCellValue()
                        : null;

                if (code.isBlank() || name.isBlank()) {
                    throw new BadRequestException(
                            "Code and Name are required at row " + (i + 1));
                }

                boolean exists = objectiveRepository
                        .existsByTopicIdAndCode(topicId, code);

                if (exists) {
                    throw new BadRequestException(
                            "Duplicate code in topic: " + code);
                }

                TopicObjective objective = TopicObjective.builder()
                        .topic(topic)
                        .code(code)
                        .name(name)
                        .details(details)
                        .build();

                objectiveRepository.save(objective);
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to import objectives", e);
        }
    }
}