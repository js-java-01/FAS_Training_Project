package com.example.starter_project_2025.system.topic.controller;

import com.example.starter_project_2025.system.topic.dto.TopicTimeAllocationDTO;
import com.example.starter_project_2025.system.topic.service.TopicTimeAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/time-allocation")
@RequiredArgsConstructor
public class TopicTimeAllocationController {

    private final TopicTimeAllocationService service;

    @GetMapping
    @PreAuthorize("hasAuthority('TOPIC_READ')")
    public TopicTimeAllocationDTO get(@PathVariable UUID topicId) {
        return service.get(topicId);
    }

    @PutMapping
    @PreAuthorize("hasAuthority('TOPIC_UPDATE')")
    public TopicTimeAllocationDTO save(
            @PathVariable UUID topicId,
            @RequestBody TopicTimeAllocationDTO dto) {
        return service.save(topicId, dto);
    }
}
