package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.system.assessment.dto.AssessmentDTO;
import com.example.starter_project_2025.system.assessment.dto.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.mapper.AssessmentMapper;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.spec.AssessmentSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentMapper assessmentMapper;

    @Autowired
    private AssessmentTypeRepository assessmentTypeRepository;

    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")

    public AssessmentDTO create(CreateAssessmentRequest request) {

        if (assessmentRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Assessment code already exists");
        }

        AssessmentType assessmentType = assessmentTypeRepository.findById(request.getAssessmentTypeId())
                .orElseThrow(() -> new EntityNotFoundException("AssessmentType not found"));

        Assessment assessment = assessmentMapper.toEntity(request);
        assessment.setAssessmentType(assessmentType);

        return assessmentMapper.toDto(
                assessmentRepository.save(assessment)
        );
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_UPDATE')")

    public AssessmentDTO update(Long id, UpdateAssessmentRequest request) {

        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found"));

        if (request.getAssessmentTypeId() != null) {
            AssessmentType assessmentType = assessmentTypeRepository.findById(request.getAssessmentTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("AssessmentType not found"));
            assessment.setAssessmentType(assessmentType);
        }

        assessmentMapper.updateEntityFromRequest(request, assessment);

        return assessmentMapper.toDto(
                assessmentRepository.save(assessment)
        );
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public AssessmentDTO getById(Long id) {
        return assessmentRepository.findById(id)
                .map(assessmentMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found"));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public Page<AssessmentDTO> search(
            String keyword,
            AssessmentStatus status,
            Long assessmentTypeId,
            LocalDate createdFrom,
            LocalDate createdTo,
            Pageable pageable
    ) {

        Specification<Assessment> spec = Specification
                .where(AssessmentSpecification.keyword(keyword))
                .and(AssessmentSpecification.hasStatus(status))
                .and(AssessmentSpecification.hasAssessmentType(assessmentTypeId))
                .and(AssessmentSpecification.createdAfter(createdFrom))
                .and(AssessmentSpecification.createdBefore(createdTo));

        return assessmentRepository
                .findAll(spec, pageable)
                .map(assessmentMapper::toDto);
    }
    @PreAuthorize("hasAuthority('ASSESSMENT_DELETE')")

    public void delete(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found"));
        assessmentRepository.delete(assessment);
    }


}
