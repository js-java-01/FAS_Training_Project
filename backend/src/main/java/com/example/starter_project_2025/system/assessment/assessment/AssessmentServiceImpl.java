package com.example.starter_project_2025.system.assessment.assessment;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.assessment.assessment_type.AssessmentTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AssessmentServiceImpl
        extends CrudServiceImpl<Assessment, UUID, AssessmentDTO, AssessmentFilter>
        implements AssessmentService {

    AssessmentRepository assessmentRepository;
    AssessmentMapper assessmentMapper;
    AssessmentTypeRepository assessmentTypeRepository;

    @Override
    protected BaseCrudRepository<Assessment, UUID> getRepository() {
        return assessmentRepository;
    }

    @Override
    protected BaseCrudMapper<Assessment, AssessmentDTO> getMapper() {
        return assessmentMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"code", "title", "description"};
    }

    @Override
    protected void beforeCreate(Assessment entity, AssessmentDTO request) {

        validateBusinessRules(entity);

        AssessmentType type = assessmentTypeRepository.findById(request.getAssessmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment type not found"));

        entity.setAssessmentType(type);

        if (assessmentRepository.existsByCode(entity.getCode())) {
            throw new BadRequestException("Assessment code already exists");
        }
    }

    @Override
    protected void beforeUpdate(Assessment entity, AssessmentDTO request) {

        validateBusinessRules(entity);

        if (request.getAssessmentTypeId() != null) {
            AssessmentType type = assessmentTypeRepository.findById(request.getAssessmentTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assessment type not found"));
            entity.setAssessmentType(type);
        }

        if (request.getCode() != null &&
                assessmentRepository.existsByCodeAndIdNot(request.getCode(), entity.getId())) {
            throw new BadRequestException("Assessment code already exists");
        }
    }

    @Override
    protected void beforeDelete(Assessment entity) {

        if (!entity.getSubmissions().isEmpty()) {
            throw new BadRequestException("Cannot delete assessment with submissions");
        }
    }

    private void validateBusinessRules(Assessment entity) {

        if (entity.getPassScore() > entity.getTotalScore()) {
            throw new BadRequestException("Pass score cannot exceed total score");
        }

        if (entity.getAttemptLimit() <= 0) {
            throw new BadRequestException("Attempt limit must be greater than zero");
        }

        if (entity.getTimeLimitMinutes() < 0) {
            throw new BadRequestException("Time limit must be non-negative");
        }
    }

    @Override
    public AssessmentDTO create(AssessmentDTO request) {
        return createEntity(request);
    }

    @Override
    public AssessmentDTO update(UUID id, AssessmentDTO request) {
        return updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        deleteEntity(id);
    }

    @Override
    public AssessmentDTO getById(UUID id) {
        return getByIdEntity(id);
    }

    @Override
    public Page<AssessmentDTO> getAll(Pageable pageable, String search, AssessmentFilter filter) {
        return getAllEntity(pageable, search, filter);
    }
}
