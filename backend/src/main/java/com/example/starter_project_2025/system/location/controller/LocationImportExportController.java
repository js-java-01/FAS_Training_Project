package com.example.starter_project_2025.system.location.controller;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.location.dto.LocationImportResult;
import com.example.starter_project_2025.system.location.service.LocationImportExportService;
import com.example.starter_project_2025.system.location.util.ExcelUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationImportExportController {

    private final LocationImportExportService service;

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam(defaultValue = "xlsx") String format) {
        byte[] data = service.exportLocations(format);

        String fileName = "locations." + format;
        MediaType mediaType = format.equalsIgnoreCase("csv")
                ? MediaType.TEXT_PLAIN
                : MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(mediaType)
                .body(data);
    }

    @PostMapping("/import")
    public ImportResultResponse importLocations(
            @RequestParam("file") MultipartFile file) {

        return service.importLocations(file);
    }

    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] file = ExcelUtil.generateLocationImportTemplate();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=location_import_template.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }


}
