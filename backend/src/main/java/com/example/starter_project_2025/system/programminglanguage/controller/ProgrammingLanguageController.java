package com.example.starter_project_2025.system.programminglanguage.controller;

import com.example.starter_project_2025.system.dataio.core.common.FileFormat;
import com.example.starter_project_2025.system.dataio.core.exporter.service.ExportService;
import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.core.importer.service.ImportService;
import com.example.starter_project_2025.system.programminglanguage.dto.*;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import com.example.starter_project_2025.system.programminglanguage.service.ProgrammingLanguageService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/programming-languages")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProgrammingLanguageController {

    ProgrammingLanguageService programmingLanguageServices;
    ProgrammingLanguageRepository programmingLanguageRepository;
    ExportService exportService;
    private final ImportService importService;

    @PostMapping
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_CREATE')")
    public ProgrammingLanguageResponse create(
            @Valid @RequestBody ProgrammingLanguageCreateRequest request
    ) {
        return programmingLanguageServices.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_UPDATE')")
    public ProgrammingLanguageResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody ProgrammingLanguageUpdateRequest request
    ) {
        return programmingLanguageServices.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_DELETE')")
    public void delete(@PathVariable UUID id) {
        programmingLanguageServices.delete(id);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public ProgrammingLanguageResponse getById(@PathVariable UUID id) {
        return programmingLanguageServices.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public Page<ProgrammingLanguageResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction
    ) {
        return programmingLanguageServices.list(search, page, size, direction);
    }

    // ==================== EXPORT ====================
    @GetMapping("/export")
    public void exportProgrammingLanguage(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response
    ) throws IOException {
        exportService.export(
                format,
                programmingLanguageRepository.findAll(),
                ProgrammingLanguage.class,
                response
        );
    }
    // ==================== IMPORT ====================
    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ImportResult importProgrammingLanguage(@RequestParam("file") MultipartFile file) {
        return importService.importFile(
                file,
                ProgrammingLanguage.class,
                programmingLanguageRepository
        );
    }

}
