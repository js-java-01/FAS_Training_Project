package com.example.starter_project_2025.system.semester.controller;

import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.modulegroups.dto.response.ApiResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.PageResponse;
import com.example.starter_project_2025.system.semester.dto.SemesterCreateDto;
import com.example.starter_project_2025.system.semester.dto.SemesterResponse;
import com.example.starter_project_2025.system.semester.dto.SemesterUpdateDto;
import com.example.starter_project_2025.system.semester.services.SemesterService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.ByteBuffer;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
public class SemesterController
{
    private final SemesterService semesterService;

    @GetMapping
    @Operation(summary = "Search semesters with pagination")
    @PreAuthorize("hasAuthority('SEMESTER_READ')")
    public ResponseEntity<ApiResponse<PageResponse<SemesterResponse>>> getAllSemesters(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable
    )
    {
        Page<SemesterResponse> pageResult =
                semesterService.getAllSemesters(null, userDetails.getRole(), keyword, startDate, endDate, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        PageResponse.from(pageResult),
                        "Semesters retrieved successfully"
                )
        );
    }

    @GetMapping("/my-semesters")
    @Operation(summary = "Search MY semesters with pagination")
    @PreAuthorize("hasAuthority('SEMESTER_READ')")
    public ResponseEntity<ApiResponse<PageResponse<SemesterResponse>>> getMySemesters(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable
    )
    {
        var userId = userDetails.getId();
        Page<SemesterResponse> pageResult =
                semesterService.getAllSemesters(userId, userDetails.getRole(), keyword, startDate, endDate, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        PageResponse.from(pageResult),
                        "My semesters retrieved successfully"
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SEMESTER_CREATE')")
    public ResponseEntity<SemesterResponse> createSemester(@RequestBody SemesterCreateDto data)
    {
        var res = semesterService.createSemester(data);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/update")
    @PreAuthorize("hasAuthority('SEMESTER_UPDATE')")
    public ResponseEntity<SemesterResponse> updateSemester(@RequestBody SemesterUpdateDto data)
    {
        var res = semesterService.updateSemester(data);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('SEMESTER_DELETE')")
    public ResponseEntity<Void> deleteSemester(@PathVariable UUID id)
    {
        semesterService.deleteSemester(id);
        return ResponseEntity.noContent().build();
    }

    private String toUuidString(byte[] rawId)
    {
        if (rawId == null)
        {
            return null;
        }

        if (rawId.length == 16)
        {
            ByteBuffer bb = ByteBuffer.wrap(rawId);
            return new UUID(bb.getLong(), bb.getLong()).toString();
        }

        return new String(rawId).trim();
    }
}
