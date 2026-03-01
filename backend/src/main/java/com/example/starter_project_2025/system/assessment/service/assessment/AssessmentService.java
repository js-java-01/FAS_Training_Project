package com.example.starter_project_2025.system.assessment.service.assessment;

import com.example.starter_project_2025.system.assessment.dto.assessment.response.AssessmentResponse;
import com.example.starter_project_2025.system.assessment.dto.assessment.request.CreateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.dto.assessment.request.UpdateAssessmentRequest;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.mapper.AssessmentMapper;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.spec.AssessmentSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentMapper assessmentMapper;
    private final AssessmentTypeRepository assessmentTypeRepository;

    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")

    public AssessmentResponse create(CreateAssessmentRequest request) {

        if (assessmentRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("Assessment code already exists");
        }

        AssessmentType assessmentType = assessmentTypeRepository.findById(request.assessmentTypeId())
                .orElseThrow(() -> new EntityNotFoundException("AssessmentType not found"));

        Assessment assessment = assessmentMapper.toEntity(request);
        assessment.setAssessmentType(assessmentType);

        return assessmentMapper.toDto(
                assessmentRepository.save(assessment)
        );
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_UPDATE')")

    public AssessmentResponse update(Long id, UpdateAssessmentRequest request) {

        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found"));

        if (request.assessmentTypeId() != null) {
            AssessmentType assessmentType = assessmentTypeRepository.findById(request.assessmentTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("AssessmentType not found"));
            assessment.setAssessmentType(assessmentType);
        }

        assessmentMapper.updateEntityFromRequest(request, assessment);

        return assessmentMapper.toDto(
                assessmentRepository.save(assessment)
        );
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public AssessmentResponse getById(Long id) {
        return assessmentRepository.findById(id)
                .map(assessmentMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found"));
    }

    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public Page<AssessmentResponse> search(
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

    public AssessmentResponse findByStatus(AssessmentStatus status) {
        Assessment assessment = assessmentRepository
                .findAssessmentByStatus(status)
                .orElseThrow(() -> new RuntimeException("Assessment not found with status: " + status));

        return assessmentMapper.toDto(assessment);
    }

    public AssessmentResponse updateStatus(Long id, AssessmentStatus status) {
        Assessment assessment = assessmentRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + id));

        assessment.setStatus(status);

        return assessmentMapper.toDto(
                assessmentRepository.save(assessment)
        );
    }


    public Page<AssessmentResponse> findByDifficulty(AssessmentDifficulty difficulty, Pageable pageable) {
        return assessmentRepository
                .findByDifficulty(difficulty, pageable)
                .map(assessmentMapper::toDto);
    }


}
