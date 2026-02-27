package com.example.starter_project_2025.system.assessment.service.questionTag.impl;

import com.example.starter_project_2025.system.assessment.dto.questionTag.request.CreateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.request.UpdateTagRequest;
import com.example.starter_project_2025.system.assessment.dto.questionTag.response.TagResponse;
import com.example.starter_project_2025.system.assessment.entity.Tag;
import com.example.starter_project_2025.system.assessment.mapper.TagMapper;
import com.example.starter_project_2025.system.assessment.repository.TagRepository;
import com.example.starter_project_2025.system.assessment.service.questionTag.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    @Override
    public TagResponse create(CreateTagRequest request) {

        if (tagRepository.existsByNameIgnoreCase(request.name())) {
            throw new RuntimeException("Tag name already exists");
        }

        Tag tag = new Tag();
        tag.setName(request.name());
        tag.setDescription(request.description());

        return tagMapper.toResponse(tagRepository.save(tag));
    }

    @Override
    public TagResponse update(Long id, UpdateTagRequest request) {

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        if (request.name() != null) {
            if (tagRepository.existsByNameIgnoreCase(request.name())
                    && !tag.getName().equalsIgnoreCase(request.name())) {
                throw new RuntimeException("Tag name already exists");
            }
            tag.setName(request.name());
        }

        if (request.description() != null) {
            tag.setDescription(request.description());
        }

        return tagMapper.toResponse(tagRepository.save(tag));
    }

    @Override
    public Page<TagResponse> getAll(Pageable pageable) {
        return tagRepository.findAll(pageable)
                .map(tagMapper::toResponse);
    }

    @Override
    public void delete(Long id) {

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        if (!tag.getQuestions().isEmpty()) {
            throw new RuntimeException("Cannot delete tag that is used by questions");
        }

        tagRepository.delete(tag);
    }
}
