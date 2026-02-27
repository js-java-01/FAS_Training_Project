package com.example.starter_project_2025.system.semester.controller;

import com.example.starter_project_2025.system.semester.dto.SemesterResponse;
import com.example.starter_project_2025.system.semester.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.ByteBuffer;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/semesters")
@RequiredArgsConstructor
public class SemesterController {

    private final SemesterRepository semesterRepository;

    @GetMapping
    public ResponseEntity<List<SemesterResponse>> getAllSemesters() {
        List<SemesterResponse> semesters = semesterRepository.findAllForDropdown().stream()
                .map(s -> SemesterResponse.builder()
                        .id(toUuidString(s.getId()))
                        .name(s.getName())
                        .startDate(s.getStartDate())
                        .endDate(s.getEndDate())
                        .build())
                .toList();
        return ResponseEntity.ok(semesters);
    }

    private String toUuidString(byte[] rawId) {
        if (rawId == null) {
            return null;
        }

        if (rawId.length == 16) {
            ByteBuffer bb = ByteBuffer.wrap(rawId);
            return new UUID(bb.getLong(), bb.getLong()).toString();
        }

        return new String(rawId).trim();
    }
}
