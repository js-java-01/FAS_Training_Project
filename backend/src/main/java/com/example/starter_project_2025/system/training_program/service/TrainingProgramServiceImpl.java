package com.example.starter_project_2025.system.training_program.service;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.training_program.dto.request.CreateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.request.UpdateTrainingProgramRequest;
import com.example.starter_project_2025.system.training_program.dto.response.ImportErrorResponse;
import com.example.starter_project_2025.system.training_program.dto.response.ImportTrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program.mapper.TrainingProgramMapper;
import com.example.starter_project_2025.system.training_program.repository.TrainingProgramRepository;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.training_program_topic.entity.repository.TrainingProgramTopicRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import jakarta.persistence.criteria.Predicate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingProgramServiceImpl implements TrainingProgramService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final TrainingProgramMapper mapper;
    private final TopicRepository topicRepository;
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;

    @Override
    public Page<TrainingProgramResponse> searchTrainingPrograms(
            String keyword,
            List<String> versions,
            Pageable pageable) {

        Specification<TrainingProgram> spec = (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // keyword search
            if (keyword != null && !keyword.trim().isEmpty()) {

                String likeKeyword = "%" + keyword.toLowerCase().trim() + "%";

                Predicate searchByName =
                        cb.like(cb.lower(root.get("name")), likeKeyword);

                Predicate searchByDescription =
                        cb.like(cb.lower(root.get("description")), likeKeyword);

                Predicate searchByVersion =
                        cb.like(cb.lower(root.get("version")), likeKeyword);

                predicates.add(cb.or(
                        searchByName,
                        searchByDescription,
                        searchByVersion
                ));
            }

            // multiple version filter
            if (versions != null && !versions.isEmpty()) {

                CriteriaBuilder.In<String> inClause = cb.in(root.get("version"));

                for (String v : versions) {
                    inClause.value(v);
                }

                predicates.add(inClause);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return trainingProgramRepository
                .findAll(spec, pageable)
                .map(mapper::toResponse);
    }

    @Transactional
    public TrainingProgramResponse create(CreateTrainingProgramRequest request) {

        if (trainingProgramRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Training Program name already exists");
        }

        TrainingProgram program = new TrainingProgram();
        program.setName(request.getName().trim());
        program.setVersion(request.getVersion().trim());
        program.setDescription(request.getDescription());

        TrainingProgram savedProgram = trainingProgramRepository.saveAndFlush(program);

        Set<Topic> topics = topicRepository.findAllById(request.getTopicIds())
                .stream()
                .collect(Collectors.toSet());

        if (topics.size() != request.getTopicIds().size()) {
            throw new RuntimeException("Some topics not found");
        }

        Set<TrainingProgramTopic> relations = topics.stream()
                .map(topic -> TrainingProgramTopic.builder()
                        .trainingProgram(savedProgram)
                        .topic(topic)
                        .build())
                .collect(Collectors.toSet());

        trainingProgramTopicRepository.saveAll(relations);
        savedProgram.setTrainingProgramTopics(relations);

        return mapper.toResponse(savedProgram);
    }

    @Override
    @Transactional(readOnly = true)
    public TrainingProgramResponse getById(UUID id) {

        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training Program not found"));

        return mapper.toResponse(program);
    }

    @Override
    @Transactional
    public void delete(UUID id) {

        if (!trainingProgramRepository.existsById(id)) {
            throw new RuntimeException("Training Program not found");
        }
        trainingProgramRepository.deleteById(id);
    }

    @Transactional
    public TrainingProgramResponse update(UUID id, UpdateTrainingProgramRequest request) {

        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training program not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            program.setName(request.getName());
        }

        if (request.getDescription() != null) {
            program.setDescription(request.getDescription());
        }

        if (request.getVersion() != null && !request.getVersion().isBlank()) {
            program.setVersion(request.getVersion());
        }

        if (request.getTopicIds() != null) {

            if (request.getTopicIds().isEmpty()) {
                throw new RuntimeException("Training program must have at least 1 topic");
            }

            Set<Topic> topics = topicRepository.findAllById(request.getTopicIds())
                    .stream()
                    .collect(Collectors.toSet());

            if (topics.size() != request.getTopicIds().size()) {
                throw new RuntimeException("Some topics not found");
            }

            Set<TrainingProgramTopic> relations = topics.stream()
                    .map(topic -> TrainingProgramTopic.builder()
                            .trainingProgram(program)
                            .topic(topic)
                            .build())
                    .collect(Collectors.toSet());

                trainingProgramTopicRepository.deleteAllByTrainingProgram_Id(program.getId());
                trainingProgramTopicRepository.saveAll(relations);
            program.setTrainingProgramTopics(relations);
        }

        return mapper.toResponse(program);
    }

    @Override
    public ByteArrayInputStream exportTrainingPrograms() throws IOException {

        String[] columns = {
                "Program Name",
                "Version",
                "Description",
                "Topics"
        };

        List<TrainingProgram> programs = trainingProgramRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Training Programs");

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

            for (TrainingProgram program : programs) {

                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(program.getName());
                row.createCell(1).setCellValue(program.getVersion());
                row.createCell(2).setCellValue(program.getDescription());

                String topics = program.getTrainingProgramTopics()
                        .stream()
                        .map(rel -> rel.getTopic().getTopicCode())
                        .collect(Collectors.joining(","));

                row.createCell(3).setCellValue(topics);
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);

            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    @Override
    public ByteArrayInputStream downloadTemplate() throws IOException {

        String[] columns = {
                "Program Name",
                "Version",
                "Description",
                "Topic Codes (comma separated)"
        };

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Template");

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

            Row sample = sheet.createRow(1);

            sample.createCell(0).setCellValue("Java Developer Training Program");
            sample.createCell(1).setCellValue("1.0.0");
            sample.createCell(2).setCellValue("Training program for Java developer");
            sample.createCell(3).setCellValue("T-JAVA-01,T-JAVA-02");

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);

            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    @Override
    @Transactional
    public ImportTrainingProgramResponse importTrainingPrograms(MultipartFile file) throws IOException {

        List<ImportErrorResponse> errors = new ArrayList<>();

        int totalRows = 0;
        int successCount = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            totalRows = sheet.getLastRowNum();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row == null) continue;

                boolean hasError = false;

                String name = getCellValue(row.getCell(0));
                String version = getCellValue(row.getCell(1));
                String description = getCellValue(row.getCell(2));
                String topicCodes = getCellValue(row.getCell(3));

                if (name == null || name.isBlank()) {
                    errors.add(new ImportErrorResponse(i + 1, "name", "Program name is required"));
                    hasError = true;
                }

                if (!name.isBlank() && trainingProgramRepository.existsByNameIgnoreCase(name)) {
                    errors.add(new ImportErrorResponse(i + 1, "name", "Training program already exists"));
                    hasError = true;
                }

                // validate version
                if (version == null || !version.matches("^\\d+(\\.\\d+)*$")) {
                    errors.add(new ImportErrorResponse(i + 1, "version",
                            "Version must contain only numbers separated by dots (e.g., 1.0 or 1.2.3)"));
                    hasError = true;
                }

                if (topicCodes == null || topicCodes.isBlank()) {
                    errors.add(new ImportErrorResponse(i + 1, "topics", "Training program must contain topics"));
                    hasError = true;
                }

                List<String> codes = new ArrayList<>();

                if (!hasError) {
                    codes = Arrays.stream(topicCodes.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isBlank())
                            .toList();
                }

                Set<Topic> topics = new HashSet<>();

                if (!hasError) {
                    topics = topicRepository.findByTopicCodeIn(codes);

                    if (topics.size() != codes.size()) {
                        errors.add(new ImportErrorResponse(i + 1, "topics", "Some topics not found"));
                        hasError = true;
                    }
                }

                if (hasError) {
                    continue;
                }

                TrainingProgram program = new TrainingProgram();
                program.setName(name.trim());
                program.setVersion(version.trim());
                program.setDescription(description);

                TrainingProgram savedProgram = trainingProgramRepository.save(program);

                Set<TrainingProgramTopic> relations = topics.stream()
                        .map(topic -> TrainingProgramTopic.builder()
                                .trainingProgram(savedProgram)
                                .topic(topic)
                                .build())
                        .collect(Collectors.toSet());

                trainingProgramTopicRepository.saveAll(relations);

                successCount++;
            }
        }

        int failedCount = errors.size();

        return new ImportTrainingProgramResponse(
                "Import completed",
                totalRows,
                successCount,
                failedCount,
                errors
        );
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
