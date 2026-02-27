package com.example.starter_project_2025.system.modulegroups.controller;

import com.example.starter_project_2025.system.modulegroups.dto.request.CreateModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.request.SearchModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.request.UpdateModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.response.*;
import com.example.starter_project_2025.system.modulegroups.service.ModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@Tag(name = "Module Management", description = "APIs for managing modules")
@SecurityRequirement(name = "bearerAuth")
public class ModuleController {

    private final ModuleService moduleService;

    /* =========================================================
       VIEW MODULE DETAIL
    ========================================================= */
    @PreAuthorize("hasAuthority('MODULE_READ')")
    @GetMapping("/{id}")
    @Operation(summary = "View module details")
    public ResponseEntity<ModuleDetail> viewModule(@PathVariable UUID id) {

        return ResponseEntity.ok(
                moduleService.getModuleDetail(id)
        );
    }

    /* =========================================================
       CREATE MODULE
    ========================================================= */
    @PostMapping
    @PreAuthorize("hasAuthority('MODULE_CREATE')")
    @Operation(summary = "Create module")
    public ResponseEntity<CreateModuleResponse> createModule(
            @Valid @RequestBody CreateModuleRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(moduleService.createModule(request));
    }

    /* =========================================================
       UPDATE MODULE
    ========================================================= */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MODULE_UPDATE')")
    @Operation(summary = "Update module")
    public ResponseEntity<UpdateModuleResponse> updateModule(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateModuleRequest request
    ) {
        UpdateModuleResponse response = moduleService.updateModule(id, request);
        return ResponseEntity.ok(response);
    }

    /* =========================================================
       GET MODULES BY GROUP
    ========================================================= */
    @GetMapping("/module-group/{id}")
    @PreAuthorize("hasAuthority('MODULE_READ')")
    @Operation(summary = "Get all modules by Module Group ID")
    public ResponseEntity<List<ModuleDetail>> getModulesByGroup(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                moduleService.getModulesByGroupId(id)
        );
    }

    /* =========================================================
       DELETE MODULE (SOFT DELETE)
    ========================================================= */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MODULE_DELETE')")
    @Operation(summary = "Delete module (soft delete)")
    public ResponseEntity<Void> deleteModule(@PathVariable UUID id) {

        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }

    /* =========================================================
       SEARCH MODULES
    ========================================================= */
    @GetMapping
    @PreAuthorize("hasAuthority('MODULE_READ')")
    @Operation(summary = "Search modules with pagination")
    public ResponseEntity<ApiResponse<PageResponse<ModuleDetail>>> searchModules(
            @ModelAttribute SearchModuleRequest request,
            Pageable pageable
    ) {

        Page<ModuleDetail> pageResult =
                moduleService.searchModules(
                        request.getKeyword(),
                        request.getModuleGroupId(),
                        request.getIsActive(),
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        PageResponse.from(pageResult),
                        "Modules retrieved successfully"
                )
        );
    }
}
