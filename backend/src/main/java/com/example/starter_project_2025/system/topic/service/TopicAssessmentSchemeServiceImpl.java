package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.AssessmentComponentRequest;
import com.example.starter_project_2025.system.topic.dto.AssessmentComponentResponse;
import com.example.starter_project_2025.system.topic.dto.AssessmentSchemeConfigDTO;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import com.example.starter_project_2025.system.topic.enums.AssessmentType;
import com.example.starter_project_2025.system.topic.mapper.AssessmentComponentMapper;
import com.example.starter_project_2025.system.topic.mapper.AssessmentSchemeConfigMapper;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentComponentRepository;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentSchemeRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicAssessmentSchemeServiceImpl implements TopicAssessmentSchemeService {

    private final TopicRepository topicRepository;
    private final TopicAssessmentSchemeRepository schemeRepository;
    private final TopicAssessmentComponentRepository componentRepository;
    private final AssessmentSchemeConfigMapper configMapper;
    private final AssessmentComponentMapper componentMapper;

        private static final String[] COMPONENT_HEADERS = new String[] {
            "type",
            "name",
            "count",
            "weight",
            "duration",
            "displayOrder",
            "isGraded",
            "note"
        };

    // ================= SCHEME CONFIG =================

    @Override
    public AssessmentSchemeConfigDTO getSchemeConfig(UUID topicId) {
        TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    Topic topic = topicRepository.findById(topicId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
                    TopicAssessmentScheme newScheme = new TopicAssessmentScheme();
                    newScheme.setTopic(topic);
                    newScheme.setMinGpaToPass(6.0);
                    newScheme.setMinAttendance(80);
                    newScheme.setAllowFinalRetake(false);
                    return schemeRepository.save(newScheme);
                });
        return configMapper.toDto(scheme);
    }

    @Override
    public AssessmentSchemeConfigDTO updateSchemeConfig(UUID topicId, AssessmentSchemeConfigDTO dto) {
        TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    Topic topic = topicRepository.findById(topicId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
                    TopicAssessmentScheme newScheme = new TopicAssessmentScheme();
                    newScheme.setTopic(topic);
                    return schemeRepository.save(newScheme);
                });
        configMapper.updateEntity(scheme, dto);
        return configMapper.toDto(scheme);
    }

    // ================= COMPONENT =================

    @Override
    public List<AssessmentComponentResponse> getComponents(UUID topicId) {
        return componentRepository.findByScheme_TopicIdOrderByDisplayOrder(topicId)
                .stream()
                .map(componentMapper::toResponse)
                .toList();
    }

    @Override
    public AssessmentComponentResponse addComponent(UUID topicId, AssessmentComponentRequest request) {
        TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    Topic topic = topicRepository.findById(topicId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
                    TopicAssessmentScheme newScheme = new TopicAssessmentScheme();
                    newScheme.setTopic(topic);
                    return schemeRepository.save(newScheme);
                });
        TopicAssessmentComponent component = componentMapper.toEntity(request);
        component.setScheme(scheme);
        componentRepository.save(component);
        return componentMapper.toResponse(component);
    }

    @Override
    public List<AssessmentComponentResponse> updateComponents(UUID topicId,
                                                              List<AssessmentComponentRequest> requests) {
        List<TopicAssessmentComponent> components = componentRepository.findByScheme_TopicIdOrderByDisplayOrder(topicId);
        for (int i = 0; i < Math.min(components.size(), requests.size()); i++) {
            componentMapper.updateEntity(components.get(i), requests.get(i));
        }
        return components.stream()
                .map(componentMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteComponent(UUID topicId, UUID componentId) {
        TopicAssessmentComponent component = componentRepository.findById(componentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Component not found"));
        if (!component.getScheme().getTopic().getId().equals(topicId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Component does not belong to this topic");
        }
        componentRepository.delete(component);
    }

    // ================= TOTAL WEIGHT =================

    @Override
    public Double getTotalWeight(UUID topicId) {
        Double total = componentRepository.sumWeightByTopicId(topicId);
        return total != null ? total : 0.0;
    }

    // ================= IMPORT / EXPORT COMPONENTS =================

    @Override
    public byte[] exportComponents(UUID topicId) {
        List<TopicAssessmentComponent> components =
                componentRepository.findByScheme_TopicIdOrderByDisplayOrder(topicId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Assessment Components");

            Row header = sheet.createRow(0);
            for (int i = 0; i < COMPONENT_HEADERS.length; i++) {
                header.createCell(i).setCellValue(COMPONENT_HEADERS[i]);
            }

            int rowIdx = 1;
            for (TopicAssessmentComponent comp : components) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(comp.getType() != null ? comp.getType().name() : "");
                row.createCell(1).setCellValue(comp.getName() != null ? comp.getName() : "");
                row.createCell(2).setCellValue(comp.getCount() != null ? comp.getCount() : 0);
                row.createCell(3).setCellValue(comp.getWeight() != null ? comp.getWeight() : 0.0);
                row.createCell(4).setCellValue(comp.getDuration() != null ? comp.getDuration() : 0);
                row.createCell(5).setCellValue(comp.getDisplayOrder() != null ? comp.getDisplayOrder() : 0);
                row.createCell(6).setCellValue(comp.getIsGraded() != null && comp.getIsGraded());
                row.createCell(7).setCellValue(comp.getNote() != null ? comp.getNote() : "");
            }

            for (int i = 0; i < COMPONENT_HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export assessment components", e);
        }
    }

    @Override
    public ImportResultResponse importComponents(UUID topicId, MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();

        if (file == null || file.isEmpty()) {
            result.addError(0, "file", "File is empty");
            result.buildMessage();
            return result;
        }

        String filename = file.getOriginalFilename();
        if (filename == null ||
                (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            result.addError(0, "file", "Unsupported file format. Use .xlsx or .xls");
            result.buildMessage();
            return result;
        }

        List<TopicAssessmentComponent> parsedComponents = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() == 0) {
                result.addError(0, "file", "File is empty");
                result.buildMessage();
                return result;
            }

            Row header = sheet.getRow(0);
            validateHeader(header);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    AssessmentType type = parseAssessmentType(getString(row, 0));
                    String name = getString(row, 1);
                    Integer count = getInteger(row, 2, null);
                    Double weight = getDouble(row, 3, null);
                    Integer duration = getInteger(row, 4, null);
                    Integer displayOrder = getInteger(row, 5, null);
                    Boolean isGraded = getBoolean(row, 6, null);
                    String note = getString(row, 7);

                    if (type == null) {
                        throw new IllegalArgumentException("type|Type is required");
                    }
                    if (name == null || name.isBlank()) {
                        throw new IllegalArgumentException("name|Name is required");
                    }
                    if (count == null || count <= 0) {
                        throw new IllegalArgumentException("count|Count must be a positive integer");
                    }
                    if (weight == null || weight < 0 || weight > 100) {
                        throw new IllegalArgumentException("weight|Weight must be between 0 and 100");
                    }
                    if (displayOrder == null || displayOrder <= 0) {
                        throw new IllegalArgumentException("displayOrder|Order must be a positive integer");
                    }
                    if (isGraded == null) {
                        throw new IllegalArgumentException("isGraded|Graded is required");
                    }

                    TopicAssessmentComponent component = new TopicAssessmentComponent();
                    component.setType(type);
                    component.setName(name.trim());
                    component.setCount(count);
                    component.setWeight(weight);
                    component.setDuration(duration);
                    component.setDisplayOrder(displayOrder);
                    component.setIsGraded(isGraded);
                    component.setNote(note);

                    parsedComponents.add(component);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex) {
                    result.setFailedCount(result.getFailedCount() + 1);
                    String msg = ex.getMessage() == null ? "Invalid row" : ex.getMessage();
                    String[] parts = msg.split("\\|");
                    result.getErrors().add(
                            new com.example.starter_project_2025.system.common.dto.ImportErrorDetail(
                                    i + 1,
                                    parts[0],
                                    parts.length > 1 ? parts[1] : msg
                            )
                    );
                }
            }

            if (result.getTotalRows() == 0) {
                result.addError(0, "file", "File contains no data rows");
                result.buildMessage();
                return result;
            }

            if (!parsedComponents.isEmpty()) {
                TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topicId)
                        .orElseGet(() -> {
                            Topic topic = topicRepository.findById(topicId)
                                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
                            TopicAssessmentScheme newScheme = new TopicAssessmentScheme();
                            newScheme.setTopic(topic);
                            return schemeRepository.save(newScheme);
                        });

                List<TopicAssessmentComponent> existing =
                        componentRepository.findByScheme_TopicIdOrderByDisplayOrder(topicId);
                if (!existing.isEmpty()) {
                    componentRepository.deleteAll(existing);
                }

                for (TopicAssessmentComponent component : parsedComponents) {
                    component.setScheme(scheme);
                }
                componentRepository.saveAll(parsedComponents);
            }

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import assessment components", e);
        }

        result.buildMessage();
        return result;
    }

    @Override
    public byte[] downloadComponentsTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Assessment Components Template");

            Row header = sheet.createRow(0);
            for (int i = 0; i < COMPONENT_HEADERS.length; i++) {
                header.createCell(i).setCellValue(COMPONENT_HEADERS[i]);
            }

            Row example = sheet.createRow(1);
            example.createCell(0).setCellValue("QUIZ");
            example.createCell(1).setCellValue("Quiz 1");
            example.createCell(2).setCellValue(1);
            example.createCell(3).setCellValue(20);
            example.createCell(4).setCellValue(30);
            example.createCell(5).setCellValue(1);
            example.createCell(6).setCellValue(true);
            example.createCell(7).setCellValue("Optional note");

            for (int i = 0; i < COMPONENT_HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate components template", e);
        }
    }

    private void validateHeader(Row header) {
        if (header == null || header.getLastCellNum() != COMPONENT_HEADERS.length) {
            throw new RuntimeException("Invalid template format");
        }

        for (int i = 0; i < COMPONENT_HEADERS.length; i++) {
            Cell cell = header.getCell(i);
            if (cell == null || !cell.getStringCellValue().trim()
                    .equalsIgnoreCase(COMPONENT_HEADERS[i])) {
                throw new RuntimeException("Invalid template header. Expected: "
                        + COMPONENT_HEADERS[i] + " at column " + (i + 1));
            }
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int i = 0; i < COMPONENT_HEADERS.length; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                if (cell.getCellType() != CellType.STRING || !cell.getStringCellValue().trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private String getString(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }
        return null;
    }

    private Integer getInteger(Row row, int index, Integer defaultValue) {
        Cell cell = row.getCell(index);
        if (cell == null) return defaultValue;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        if (cell.getCellType() == CellType.STRING) {
            String value = cell.getStringCellValue().trim();
            if (value.isEmpty()) return defaultValue;
            return Integer.parseInt(value);
        }
        return defaultValue;
    }

    private Double getDouble(Row row, int index, Double defaultValue) {
        Cell cell = row.getCell(index);
        if (cell == null) return defaultValue;
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        }
        if (cell.getCellType() == CellType.STRING) {
            String value = cell.getStringCellValue().trim();
            if (value.isEmpty()) return defaultValue;
            return Double.parseDouble(value);
        }
        return defaultValue;
    }

    private Boolean getBoolean(Row row, int index, Boolean defaultValue) {
        Cell cell = row.getCell(index);
        if (cell == null) return defaultValue;
        if (cell.getCellType() == CellType.BOOLEAN) {
            return cell.getBooleanCellValue();
        }
        if (cell.getCellType() == CellType.STRING) {
            String value = cell.getStringCellValue().trim().toLowerCase();
            if (value.isEmpty()) return defaultValue;
            if (value.equals("true") || value.equals("yes") || value.equals("1")) return true;
            if (value.equals("false") || value.equals("no") || value.equals("0")) return false;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue() != 0;
        }
        return defaultValue;
    }

    private AssessmentType parseAssessmentType(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return AssessmentType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("type|Invalid assessment type: " + value);
        }
    }
}