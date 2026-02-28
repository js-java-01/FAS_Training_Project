package com.example.starter_project_2025.system.user.controller;

import com.example.starter_project_2025.system.dataio.core.common.FileFormat;
import com.example.starter_project_2025.system.dataio.core.exporter.service.ExportService;
import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.core.importer.service.ImportService;
import com.example.starter_project_2025.system.user.dto.UserCreateRequest;
import com.example.starter_project_2025.system.user.dto.UserResponse;
import com.example.starter_project_2025.system.user.dto.UserUpdateRequest;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    UserService userService;
    UserRepository userRepository;
    ExportService exportService;
    ImportService importService;

    @GetMapping("/export")
    public void exportFile(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response
    ) throws IOException {
        exportService.export(
                format,
                userRepository.findAll(),
                User.class,
                response
        );
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ImportResult importFile(
            @RequestParam("file") MultipartFile file
    ) {
        return importService.importFile(
                file,
                User.class,
                userRepository
        );
    }

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getPage(
            @PageableDefault Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<UUID> roleIds,
            @RequestParam(required = false) LocalDateTime createFrom,
            @RequestParam(required = false) LocalDateTime createTo,
            @RequestParam(required = false) Boolean isActive
    ) {
        return ResponseEntity.ok(userService.getAll(
                pageable,
                search,
                roleIds,
                createFrom,
                createTo,
                isActive
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(
            @Valid @RequestBody UserCreateRequest request
    ) {
        return ResponseEntity.ok(userService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id
    ) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
