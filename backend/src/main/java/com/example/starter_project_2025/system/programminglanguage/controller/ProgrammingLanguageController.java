package com.example.starter_project_2025.system.programminglanguage.controller;

import com.example.starter_project_2025.system.programminglanguage.dto.*;
import com.example.starter_project_2025.system.programminglanguage.service.ProgrammingLanguageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/programming-languages")
public class ProgrammingLanguageController {

    private final ProgrammingLanguageService service;

    public ProgrammingLanguageController(ProgrammingLanguageService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_CREATE')")
    public ProgrammingLanguageResponse create(
            @Valid @RequestBody ProgrammingLanguageCreateRequest request
    ) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_UPDATE')")
    public ProgrammingLanguageResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ProgrammingLanguageUpdateRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_DELETE')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public ProgrammingLanguageResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public Page<ProgrammingLanguageResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction
    ) {
        return service.list(search, page, size, direction);
    }

    // ==================== EXPORT ====================

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public ResponseEntity<byte[]> exportToExcel() {
        byte[] excelContent = service.exportToExcel();

        String filename = "programming-languages-" +
                LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelContent);
    }

    // ==================== IMPORT TEMPLATE ====================

    @GetMapping("/import-template")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_CREATE')")
    public ResponseEntity<byte[]> downloadImportTemplate() {
        byte[] template = service.generateImportTemplate();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"programming-languages-template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(template);
    }

    // ==================== IMPORT ====================

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_CREATE')")
    public ResponseEntity<ImportResultResponse> importFromExcel(
            @RequestParam("file") MultipartFile file
    ) {
        ImportResultResponse result = service.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
}
