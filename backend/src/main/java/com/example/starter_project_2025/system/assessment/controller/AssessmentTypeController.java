package com.example.starter_project_2025.system.assessment.controller;

import com.example.starter_project_2025.system.assessment.dto.assessmentType.response.AssessmentTypeResponse;
import com.example.starter_project_2025.system.assessment.dto.assessmentType.request.CreateAssessmentTypeRequest;
import com.example.starter_project_2025.system.assessment.dto.assessmentType.request.UpdateAssessmentTypeRequest;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.service.assessmentType.AssessmentTypeService;
import com.example.starter_project_2025.system.dataio.core.common.FileFormat;
import com.example.starter_project_2025.system.dataio.core.exporter.service.ExportService;
import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.core.importer.service.ImportService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/assessment-type")
public class AssessmentTypeController {


    private final AssessmentTypeService assessService;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final ExportService exportService;
    private final ImportService importService;

    @PostMapping
    public ResponseEntity<AssessmentTypeResponse> create(
            @Valid @RequestBody CreateAssessmentTypeRequest request) {

        return ResponseEntity.ok(assessService.create(request));
    }


    @PutMapping("/{id}")
    public ResponseEntity<AssessmentTypeResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateAssessmentTypeRequest request) {

        return ResponseEntity.ok(assessService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        assessService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentTypeResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(assessService.findById(id));
    }

    @GetMapping
    public ResponseEntity<Page<AssessmentTypeResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String name,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @PageableDefault(size = 20, sort = "createdAt")
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                assessService.search(
                        keyword,
                        pageable,
                        name,
                        fromDate,
                        toDate
                )
        );
    }


    @GetMapping("/export")
    public void exportAssessmentTypes(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response
    ) throws IOException {

        exportService.export(
                format,
                assessmentTypeRepository.findAll(),
                AssessmentType.class,
                response
        );
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ImportResult importAssessmentTypes(
            @RequestParam("file") MultipartFile file
    ) {

        return importService.importFile(
                file,
                AssessmentType.class,
                assessmentTypeRepository
        );
    }



//    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<ImportResultDTO> importAssessments(@RequestParam("file") MultipartFile file) {
//
//        return ResponseEntity.ok(assessService.importAssessments(file));
//    }

//    @GetMapping("/export")
//    public ResponseEntity<InputStreamResource> exportAssessmentTypes() throws IOException {
//
//        ByteArrayInputStream in = assessService.exportAssessments();
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.add("Content-Disposition", "attachment; filename=assessment-types.xlsx");
//
//        return ResponseEntity
//                .ok()
//                .headers(headers)
//                .contentType(MediaType.APPLICATION_OCTET_STREAM)
//                .body(new InputStreamResource(in));
//    }

//    @GetMapping("/template")
//    public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException {
//
//        ByteArrayInputStream in = assessService.downloadAssessmentTemplate();
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assessment-template.xlsx");
//
//        return ResponseEntity
//                .ok()
//                .headers(headers)
//                .contentType(MediaType.APPLICATION_OCTET_STREAM)
//                .body(new InputStreamResource(in));
//    }




}
