package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentSchemeOnlineConfigDTO;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.entity.CourseAssessmentComponentOnline;
import com.example.starter_project_2025.system.course_online.entity.CourseAssessmentSchemeOnline;
import com.example.starter_project_2025.system.course_online.enums.AssessmentTypeOnline;
import com.example.starter_project_2025.system.course_online.mapper.CourseAssessmentComponentOnlineMapper;
import com.example.starter_project_2025.system.course_online.repository.CourseAssessmentComponentOnlineRepository;
import com.example.starter_project_2025.system.course_online.repository.CourseAssessmentSchemeOnlineRepository;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentComponentRepository;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentSchemeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseAssessmentSchemeOnlineServiceImpl
                implements CourseAssessmentSchemeOnlineService {

        private final CourseAssessmentSchemeOnlineRepository schemeRepo;
        private final CourseAssessmentComponentOnlineRepository componentRepo;
        private final CourseAssessmentComponentOnlineMapper mapper;
        private final CourseOnlineRepository courseRepo;
        private final TopicAssessmentSchemeRepository topicSchemeRepo;
        private final TopicAssessmentComponentRepository topicComponentRepo;

        @Override
        public CourseAssessmentSchemeOnlineConfigDTO getSchemeConfig(UUID courseId) {

                CourseAssessmentSchemeOnline scheme = schemeRepo.findByCourseId(courseId)
                                .orElseGet(() -> {
                                        CourseOnline course = courseRepo.findById(courseId)
                                                        .orElseThrow(() -> new RuntimeException("CourseOnline not found"));
                                        CourseAssessmentSchemeOnline newScheme = CourseAssessmentSchemeOnline.builder()
                                                        .course(course)
                                                        .minGpaToPass(6.0)
                                                        .minAttendance(80.0)
                                                        .allowFinalRetake(false)
                                                        .build();
                                        return schemeRepo.save(newScheme);
                                });

                CourseAssessmentSchemeOnlineConfigDTO dto = new CourseAssessmentSchemeOnlineConfigDTO();
                dto.setMinGpaToPass(scheme.getMinGpaToPass());
                dto.setMinAttendance(scheme.getMinAttendance());
                dto.setAllowFinalRetake(scheme.getAllowFinalRetake());

                return dto;
        }

        @Override
        public void updateSchemeConfig(UUID courseId,
                        CourseAssessmentSchemeOnlineConfigDTO dto) {

                CourseAssessmentSchemeOnline scheme = schemeRepo.findByCourseId(courseId)
                                .orElseGet(() -> {
                                        CourseOnline course = courseRepo.findById(courseId)
                                                        .orElseThrow(() -> new RuntimeException("CourseOnline not found"));
                                        return schemeRepo.save(CourseAssessmentSchemeOnline.builder()
                                                        .course(course)
                                                        .minGpaToPass(6.0)
                                                        .minAttendance(80.0)
                                                        .allowFinalRetake(false)
                                                        .build());
                                });

                scheme.setMinGpaToPass(dto.getMinGpaToPass());
                scheme.setMinAttendance(dto.getMinAttendance());
                scheme.setAllowFinalRetake(dto.getAllowFinalRetake());
        }

        @Override
        public List<CourseAssessmentComponentOnlineResponse> getComponents(UUID courseId) {

                return componentRepo
                                .findByScheme_CourseIdOrderByDisplayOrder(courseId)
                                .stream()
                                .map(mapper::toResponse)
                                .toList();
        }

        @Override
        public void updateComponents(UUID courseId,
                        List<CourseAssessmentComponentOnlineRequest> request) {

                CourseAssessmentSchemeOnline scheme = schemeRepo.findByCourseId(courseId)
                                .orElseGet(() -> {
                                        CourseOnline course = courseRepo.findById(courseId)
                                                        .orElseThrow(() -> new RuntimeException("CourseOnline not found"));
                                        return schemeRepo.save(CourseAssessmentSchemeOnline.builder()
                                                        .course(course)
                                                        .minGpaToPass(6.0)
                                                        .minAttendance(80.0)
                                                        .allowFinalRetake(false)
                                                        .build());
                                });

                scheme.getComponents().clear();

                for (CourseAssessmentComponentOnlineRequest r : request) {

                        CourseAssessmentComponentOnline component = CourseAssessmentComponentOnline.builder()
                                        .scheme(scheme)
                                        .type(r.getType())
                                        .name(r.getName())
                                        .itemCount(r.getCount())
                                        .weight(r.getWeight())
                                        .duration(r.getDuration())
                                        .displayOrder(r.getDisplayOrder())
                                        .graded(r.getGraded())
                                        .build();

                        scheme.getComponents().add(component);
                }
        }

        @Override
        public void deleteComponent(UUID courseId, UUID componentId) {

                CourseAssessmentComponentOnline component = componentRepo.findById(componentId)
                                .orElseThrow(() -> new RuntimeException("Not found"));

                if (!component.getScheme().getCourse().getId().equals(courseId)) {
                        throw new RuntimeException("Invalid course");
                }

                componentRepo.delete(component);
        }

        @Override
        public void cloneFromTopic(UUID topicId, UUID courseId) {

                // get course
                CourseOnline course = courseRepo.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("CourseOnline not found"));

                // get topic scheme
                TopicAssessmentScheme topicScheme = topicSchemeRepo.findByTopicId(topicId)
                                .orElseThrow(() -> new RuntimeException("Topic scheme not found"));

                // delete existing scheme if any
                schemeRepo.findByCourseId(courseId).ifPresent(schemeRepo::delete);
                schemeRepo.flush();

                // create course scheme
                CourseAssessmentSchemeOnline courseScheme = CourseAssessmentSchemeOnline.builder()
                                .course(course)
                                .minGpaToPass(topicScheme.getMinGpaToPass())
                                .minAttendance(topicScheme.getMinAttendance() != null
                                                ? topicScheme.getMinAttendance().doubleValue()
                                                : 80.0)
                                .allowFinalRetake(topicScheme.getAllowFinalRetake())
                                .build();

                schemeRepo.save(courseScheme);

                // get topic components
                List<TopicAssessmentComponent> topicComponents = topicComponentRepo
                                .findByScheme_TopicIdOrderByDisplayOrder(topicId);

                // clone components
                List<CourseAssessmentComponentOnline> courseComponents = topicComponents.stream()
                                .map(tc -> CourseAssessmentComponentOnline.builder()
                                                .scheme(courseScheme)
                                                .type(AssessmentTypeOnline.valueOf(tc.getType().name()))
                                                .name(tc.getName())
                                                .itemCount(tc.getCount())
                                                .weight(tc.getWeight())
                                                .duration(tc.getDuration())
                                                .displayOrder(tc.getDisplayOrder())
                                                .graded(tc.getIsGraded())
                                                .build())
                                .toList();

                componentRepo.saveAll(courseComponents);
        }

        // ================= IMPORT / EXPORT COMPONENTS =================

        private static final String[] COMPONENT_HEADERS = {
                        "type", "name", "count", "weight", "duration", "displayOrder", "isGraded"
        };

        @Override
        public byte[] exportComponents(UUID courseId) {
                List<CourseAssessmentComponentOnline> components = componentRepo
                                .findByScheme_CourseIdOrderByDisplayOrder(courseId);

                try (Workbook workbook = new XSSFWorkbook()) {
                        Sheet sheet = workbook.createSheet("Assessment Components");
                        Row header = sheet.createRow(0);
                        for (int i = 0; i < COMPONENT_HEADERS.length; i++) {
                                header.createCell(i).setCellValue(COMPONENT_HEADERS[i]);
                        }
                        int rowIdx = 1;
                        for (CourseAssessmentComponentOnline c : components) {
                                Row row = sheet.createRow(rowIdx++);
                                row.createCell(0).setCellValue(c.getType() != null ? c.getType().name() : "");
                                row.createCell(1).setCellValue(c.getName() != null ? c.getName() : "");
                                row.createCell(2).setCellValue(c.getItemCount() != null ? c.getItemCount() : 0);
                                row.createCell(3).setCellValue(c.getWeight() != null ? c.getWeight() : 0.0);
                                row.createCell(4).setCellValue(c.getDuration() != null ? c.getDuration() : 0);
                                row.createCell(5).setCellValue(c.getDisplayOrder() != null ? c.getDisplayOrder() : 0);
                                row.createCell(6).setCellValue(c.getGraded() != null && c.getGraded());
                        }
                        for (int i = 0; i < COMPONENT_HEADERS.length; i++)
                                sheet.autoSizeColumn(i);
                        ByteArrayOutputStream out = new ByteArrayOutputStream();
                        workbook.write(out);
                        return out.toByteArray();
                } catch (Exception e) {
                        throw new RuntimeException("Failed to export assessment components", e);
                }
        }

        @Override
        public ImportResultResponse importComponents(UUID courseId, MultipartFile file) {
                ImportResultResponse result = new ImportResultResponse();

                if (file == null || file.isEmpty()) {
                        result.addError(0, "file", "File is empty");
                        result.buildMessage();
                        return result;
                }
                String filename = file.getOriginalFilename();
                if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
                        result.addError(0, "file", "Unsupported file format. Use .xlsx or .xls");
                        result.buildMessage();
                        return result;
                }

                List<CourseAssessmentComponentOnline> parsed = new ArrayList<>();

                try (InputStream is = file.getInputStream();
                                Workbook workbook = WorkbookFactory.create(is)) {

                        Sheet sheet = workbook.getSheetAt(0);
                        if (sheet.getPhysicalNumberOfRows() == 0) {
                                result.addError(0, "file", "File is empty");
                                result.buildMessage();
                                return result;
                        }

                        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                                Row row = sheet.getRow(i);
                                if (row == null)
                                        continue;
                                result.setTotalRows(result.getTotalRows() + 1);
                                try {
                                        String typeStr = getCellString(row, 0);
                                        String name = getCellString(row, 1);
                                        Integer count = getCellInt(row, 2);
                                        Double weight = getCellDouble(row, 3);
                                        Integer duration = getCellInt(row, 4);
                                        Integer order = getCellInt(row, 5);
                                        Boolean graded = getCellBoolean(row, 6);

                                        if (typeStr == null || typeStr.isBlank())
                                                throw new IllegalArgumentException("type|Type is required");
                                        if (name == null || name.isBlank())
                                                throw new IllegalArgumentException("name|Name is required");
                                        if (count == null || count <= 0)
                                                throw new IllegalArgumentException("count|Count must be positive");
                                        if (weight == null || weight < 0 || weight > 100)
                                                throw new IllegalArgumentException("weight|Weight must be 0-100");
                                        if (order == null || order <= 0)
                                                throw new IllegalArgumentException(
                                                                "displayOrder|Order must be positive");

                                        AssessmentTypeOnline type = AssessmentTypeOnline.valueOf(typeStr.trim().toUpperCase());
                                        CourseAssessmentComponentOnline c = CourseAssessmentComponentOnline.builder()
                                                        .type(type)
                                                        .name(name.trim())
                                                        .itemCount(count)
                                                        .weight(weight)
                                                        .duration(duration)
                                                        .displayOrder(order)
                                                        .graded(graded != null && graded)
                                                        .build();
                                        parsed.add(c);
                                        result.setSuccessCount(result.getSuccessCount() + 1);
                                } catch (Exception ex) {
                                        String msg = ex.getMessage() == null ? "Invalid row" : ex.getMessage();
                                        String[] parts = msg.split("\\|");
                                        result.addError(i + 1, parts[0], parts.length > 1 ? parts[1] : msg);
                                }
                        }

                        if (!parsed.isEmpty()) {
                                CourseOnline course = courseRepo.findById(courseId)
                                                .orElseThrow(() -> new RuntimeException("CourseOnline not found"));
                                CourseAssessmentSchemeOnline scheme = schemeRepo.findByCourseId(courseId)
                                                .orElseGet(() -> schemeRepo.save(CourseAssessmentSchemeOnline.builder()
                                                                .course(course).minGpaToPass(6.0)
                                                                .minAttendance(80.0).allowFinalRetake(false)
                                                                .build()));
                                List<CourseAssessmentComponentOnline> existing = componentRepo
                                                .findByScheme_CourseIdOrderByDisplayOrder(courseId);
                                if (!existing.isEmpty())
                                        componentRepo.deleteAll(existing);
                                for (CourseAssessmentComponentOnline c : parsed)
                                        c.setScheme(scheme);
                                componentRepo.saveAll(parsed);
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
                        example.createCell(3).setCellValue(20.0);
                        example.createCell(4).setCellValue(30);
                        example.createCell(5).setCellValue(1);
                        example.createCell(6).setCellValue(true);
                        for (int i = 0; i < COMPONENT_HEADERS.length; i++)
                                sheet.autoSizeColumn(i);
                        ByteArrayOutputStream out = new ByteArrayOutputStream();
                        workbook.write(out);
                        return out.toByteArray();
                } catch (Exception e) {
                        throw new RuntimeException("Failed to generate template", e);
                }
        }

        // ── cell helpers ──
        private String getCellString(Row row, int col) {
                Cell cell = row.getCell(col);
                if (cell == null)
                        return null;
                return switch (cell.getCellType()) {
                        case STRING -> cell.getStringCellValue().trim();
                        case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
                        case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                        default -> null;
                };
        }

        private Integer getCellInt(Row row, int col) {
                Cell cell = row.getCell(col);
                if (cell == null)
                        return null;
                if (cell.getCellType() == CellType.NUMERIC)
                        return (int) cell.getNumericCellValue();
                if (cell.getCellType() == CellType.STRING) {
                        try {
                                return Integer.parseInt(cell.getStringCellValue().trim());
                        } catch (NumberFormatException e) {
                                return null;
                        }
                }
                return null;
        }

        private Double getCellDouble(Row row, int col) {
                Cell cell = row.getCell(col);
                if (cell == null)
                        return null;
                if (cell.getCellType() == CellType.NUMERIC)
                        return cell.getNumericCellValue();
                if (cell.getCellType() == CellType.STRING) {
                        try {
                                return Double.parseDouble(cell.getStringCellValue().trim());
                        } catch (NumberFormatException e) {
                                return null;
                        }
                }
                return null;
        }

        private Boolean getCellBoolean(Row row, int col) {
                Cell cell = row.getCell(col);
                if (cell == null)
                        return null;
                if (cell.getCellType() == CellType.BOOLEAN)
                        return cell.getBooleanCellValue();
                if (cell.getCellType() == CellType.STRING) {
                        String v = cell.getStringCellValue().trim().toLowerCase();
                        return v.equals("true") || v.equals("1") || v.equals("yes");
                }
                if (cell.getCellType() == CellType.NUMERIC)
                        return cell.getNumericCellValue() != 0;
                return null;
        }
}
