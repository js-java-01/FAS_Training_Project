package com.example.starter_project_2025.system.assessment.service.assessmentType;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.dto.*;
import com.example.starter_project_2025.system.assessment.dto.assessmentType.request.CreateAssessmentTypeRequest;
import com.example.starter_project_2025.system.assessment.dto.assessmentType.request.UpdateAssessmentTypeRequest;
import com.example.starter_project_2025.system.assessment.dto.assessmentType.response.AssessmentTypeResponse;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.mapper.AssessmentTypeMapper;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.spec.AssessmentTypeSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssessmentTypeService {

    private final AssessmentTypeMapper assessmentTypeMapper;
    private final AssessmentTypeRepository assessRepo;

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public AssessmentTypeResponse findById(String id) {
        AssessmentType assessmentType = assessRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));

        return assessmentTypeMapper.toDto(assessmentType);
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")
    public AssessmentTypeResponse create(CreateAssessmentTypeRequest request) {

        if (assessRepo.existsByName(request.name())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment name already exists");
        }

        AssessmentType assessmentType = assessmentTypeMapper.toEntity(request);
        return assessmentTypeMapper.toDto(assessRepo.save(assessmentType));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_UPDATE')")
    public AssessmentTypeResponse update(String id, UpdateAssessmentTypeRequest request) {

        AssessmentType assessmentType = assessRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));

        assessmentTypeMapper.updateEntityFromRequest(request, assessmentType);
        return assessmentTypeMapper.toDto(assessRepo.save(assessmentType));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_DELETE')")
    public void delete(String id) {

        AssessmentType assessmentType = assessRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));

        assessRepo.delete(assessmentType);
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public Page<AssessmentTypeResponse> search(
            String searchContent,
            Pageable pageable,
            String name,
            LocalDate createdFrom,
            LocalDate createdTo
    ) {
        Specification<AssessmentType> spec = Specification
                .where(AssessmentTypeSpecification.keyword(searchContent))
                .and(AssessmentTypeSpecification.nameContains(name))
                .and(AssessmentTypeSpecification.createdAfter(createdFrom))
                .and(AssessmentTypeSpecification.createdBefore(createdTo));


        return assessRepo
                .findAll(spec, pageable)
                .map(assessmentTypeMapper::toDto);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")
    public ImportResultDTO importAssessments(MultipartFile file) {

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        List<AssessmentType> toSave = new ArrayList<>();
        List<ImportErrorDTO> errors = new ArrayList<>();

        int totalRows = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            Row header = sheet.getRow(0);
            if (header == null
                    || !"Name".equalsIgnoreCase(header.getCell(0).getStringCellValue().trim())
                    || !"Description".equalsIgnoreCase(header.getCell(1).getStringCellValue().trim())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid template format");
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                totalRows++;
                Row row = sheet.getRow(i);

                if (row == null)
                    continue;

                String name = getCellValue(row.getCell(0));
                String description = getCellValue(row.getCell(1));

                if (name.isBlank()) {
                    errors.add(new ImportErrorDTO(i + 1, "Name is required"));
                    continue;
                }

                if (name.length() < 5 || name.length() > 255) {
                    errors.add(new ImportErrorDTO(i + 1, "Name must be between 5 and 255 characters"));
                    continue;
                }

                if (description != null && !description.isBlank()
                        && (description.length() < 10 || description.length() > 250)) {
                    errors.add(new ImportErrorDTO(i + 1, "Description must be between 10 and 250 characters"));
                    continue;
                }

                if (assessRepo.existsByName(name)) {
                    errors.add(new ImportErrorDTO(i + 1, "Name already exists"));
                    continue;
                }

                AssessmentType a = new AssessmentType();
                a.setName(name);
                a.setDescription(description);

                toSave.add(a);
            }

            assessRepo.saveAll(toSave);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read file");
        }

        return new ImportResultDTO(
                totalRows,
                toSave.size(),
                errors.size(),
                errors);
    }

    @PreAuthorize("hasAnyAuthority('ASSESSMENT_READ')")
    public ByteArrayInputStream exportAssessments() throws IOException {

        List<AssessmentType> types = assessRepo.findAll();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Assessment Types");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("name");
        header.createCell(1).setCellValue("description");

        int rowIdx = 1;
        for (AssessmentType t : types) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(t.getName());
            row.createCell(1).setCellValue(t.getDescription());
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return new ByteArrayInputStream(out.toByteArray());
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")
    public ByteArrayInputStream downloadAssessmentTemplate() throws IOException {

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Assessment Template");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("name");
        header.createCell(1).setCellValue("description");

        Row exampleRow1 = sheet.createRow(1);
        exampleRow1.createCell(0).setCellValue("Entrance Quiz");
        exampleRow1.createCell(1).setCellValue("Applied for entrance exams");
        Row exampleRow2 = sheet.createRow(2);
        exampleRow2.createCell(0).setCellValue("Final Exam");
        exampleRow2.createCell(1).setCellValue("End of course final assessment");

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return new ByteArrayInputStream(out.toByteArray());
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

}
