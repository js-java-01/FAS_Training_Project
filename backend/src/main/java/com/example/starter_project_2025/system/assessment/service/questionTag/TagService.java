package com.example.starter_project_2025.system.assessment.service.questionTag;

import com.example.starter_project_2025.system.assessment.dto.questionTag.request.CreateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.request.UpdateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagCountResponse;
import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TagService {
    TagResponse create(CreateTagRequest request);

    TagResponse update(Long id, UpdateTagRequest request);

    Page<TagResponse> getAll(Pageable pageable);

    void delete(Long id);

    List<TagCountResponse> getTagsByCategory(UUID categoryId);

}
