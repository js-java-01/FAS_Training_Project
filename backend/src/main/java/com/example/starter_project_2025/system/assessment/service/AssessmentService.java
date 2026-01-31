package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.mapper.AssessmentMapper;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentMapper assessmentMapper;

    @Autowired
    private AssessmentRepository assessRepo;

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public AssessmentDTO findById(String id) {
        Assessment assessment = assessRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));
        return assessmentMapper.toDto(assessment);
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public List<AssessmentDTO> findAssessmentByName(String name) {
        return assessmentMapper.toDto(
                assessRepo.findByNameContainingIgnoreCase(name));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public List<AssessmentDTO> getAllAssessments() {
        return assessmentMapper.toDto(assessRepo.findAll());
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")
    public AssessmentDTO createAssessment(CreateAssessmentRequest request) {
        Assessment assessment = assessmentMapper.toEntity(request);
        return assessmentMapper.toDto(assessRepo.save(assessment));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_UPDATE')")
    public AssessmentDTO updateAssessment(String id, UpdateAssessmentRequest request) {
        Assessment assessment = assessRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));

        assessmentMapper.updateEntityFromRequest(request, assessment);

        return assessmentMapper.toDto(assessRepo.save(assessment));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_DELETE')")
    public void deleteAssessment(String id) {
        Assessment assessment = assessRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assessment not found with id: " + id));

        assessRepo.delete(assessment);
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")
    @Transactional
    public List<AssessmentDTO> importAssessments(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String fileName = file.getOriginalFilename();
        List<Assessment> assessmentsImported = new ArrayList<>();

        try {
            if (fileName != null && (fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))) {
                // Handle Excel (.xlsx, .xls)
                try (InputStream is = file.getInputStream();
                        Workbook workbook = new XSSFWorkbook(is)) {
                    Sheet sheet = workbook.getSheetAt(0);
                    boolean isHeader = true;
                    for (Row row : sheet) {
                        if (isHeader) {
                            isHeader = false;
                            continue;
                        }
                        String name = row.getCell(0) != null ? row.getCell(0).toString().trim() : "";
                        String description = row.getCell(1) != null ? row.getCell(1).toString().trim() : null;

                        if (!name.isEmpty() && !assessRepo.existsByName(name)) {
                            Assessment a = new Assessment();
                            a.setName(name);
                            a.setDescription(description);
                            assessmentsImported.add(a);
                        }
                    }
                }
            } else {
                // Handle CSV
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
                    String line;
                    boolean isHeader = true;
                    while ((line = reader.readLine()) != null) {
                        if (isHeader) {
                            isHeader = false;
                            continue;
                        }
                        String[] columns = line.split(",");
                        if (columns.length < 1)
                            continue;

                        String name = columns[0].trim();
                        String description = columns.length > 1 ? columns[1].trim() : null;

                        if (!name.isEmpty() && !assessRepo.existsByName(name)) {
                            Assessment a = new Assessment();
                            a.setName(name);
                            a.setDescription(description);
                            assessmentsImported.add(a);
                        }
                    }
                }
            }

            if (assessmentsImported.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No new valid assessments found to import");
            }

            List<Assessment> saved = assessRepo.saveAll(assessmentsImported);
            return assessmentMapper.toDto(saved);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error reading file: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('ASSESSMENT_READ')")
    public ByteArrayInputStream exportAssessments() throws IOException {

        List<Assessment> types = assessRepo.findAll();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Assessment Types");

        // Header
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("name");
        header.createCell(1).setCellValue("description");

        // Data
        int rowIdx = 1;
        for (Assessment t : types) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(t.getName());
            row.createCell(1).setCellValue(t.getDescription());
        }

        // Auto size
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return new ByteArrayInputStream(out.toByteArray());
    }

}
