package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.UpdateTopicRequest;
import com.example.starter_project_2025.system.topic.service.TopicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Tag(name = "Topic Management", description = "Topic management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TopicController
{

    private final TopicService topicService;

    @PostMapping
    @PreAuthorize("hasAuthority('TOPIC_CREATE')")
    @Operation(summary = "Create topic")
    public ResponseEntity<TopicResponse> create(@RequestBody TopicCreateRequest request)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(topicService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    @Operation(summary = "Update topic")
    public ResponseEntity<TopicResponse> update(@PathVariable UUID id,
                                                @RequestBody UpdateTopicRequest request)
    {
        return ResponseEntity.ok(topicService.update(id, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    @Operation(summary = "Get topic detail")
    public ResponseEntity<TopicResponse> getById(@PathVariable UUID id)
    {
        return ResponseEntity.ok(topicService.getById(id));
    }

    @GetMapping()
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    @Operation(summary = "Get all topics with search and filters")
    public ResponseEntity<Page<TopicResponse>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status,
            @PageableDefault(page = 0, size = 10) Pageable pageable)
    {
        return ResponseEntity.ok(topicService.getAll(keyword, level, status, pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TOPIC_DELETE')")
    @Operation(summary = "Delete topic")
    public ResponseEntity<Void> delete(@PathVariable UUID id)
    {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}