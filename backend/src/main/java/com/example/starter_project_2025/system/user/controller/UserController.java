package com.example.starter_project_2025.system.user.controller;

import com.example.starter_project_2025.system.dataio.common.FileFormat;
import com.example.starter_project_2025.system.dataio.exporter.service.ExportService;
import com.example.starter_project_2025.system.dataio.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.importer.service.ImportService;
import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
import com.example.starter_project_2025.system.user.dto.UserDTO;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Management", description = "APIs for managing users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;
    UserRepository userRepository;
    ExportService exportService;
    ImportService importService;

    @GetMapping("/export")
    public void exportUsers(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response
    ) throws IOException {
        exportService.export(
                format,
                userService.findAll(),
                User.class,
                response
        );
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ImportResult importUsers(@RequestParam("file") MultipartFile file) {
        return importService.importFile(
                file,
                User.class,
                userRepository
        );
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve all users with pagination")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(required = false) String searchContent,
            @RequestParam(required = false) UUID roleId,
            @RequestParam(required = false) LocalDateTime createFrom,
            @RequestParam(required = false) LocalDateTime createTo,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(userService.getAllUsers(
                searchContent,
                roleId,
                createFrom,
                createTo,
                isActive,
                pageable
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by ID")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Create a new user")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update an existing user")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserDTO request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Delete a user by ID")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id)
    {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle user status", description = "Activate or deactivate a user")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable UUID id)
    {
        UserDTO user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/assign-role")
    @Operation(summary = "Assign role to user", description = "Assign a role to a specific user")
    public ResponseEntity<UserDTO> assignRole(
            @PathVariable UUID userId,
            @RequestBody Map<String, UUID> request
    ) {
        UUID roleId = request.get("roleId");
        UserDTO user = userService.assignRole(userId, roleId);
        return ResponseEntity.ok(user);
    }
}
