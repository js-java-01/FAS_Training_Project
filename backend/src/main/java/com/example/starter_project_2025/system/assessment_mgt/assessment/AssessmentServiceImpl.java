package com.example.starter_project_2025.system.assessment_mgt.assessment;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentType;
import com.example.starter_project_2025.system.assessment_mgt.assessment_type.AssessmentTypeRepository;
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
public class AssessmentServiceImpl extends CrudServiceImpl<Assessment, UUID, AssessmentDTO, AssessmentFilter>
        implements AssessmentService{

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
        return new String[]{"code", "title", "difficulty"};
    }

    @Override
    public Page<AssessmentDTO> getAll(Pageable pageable, String search, AssessmentFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public AssessmentDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public AssessmentDTO create(AssessmentDTO request) {
        return super.createEntity(request);
    }

    @Override
    public AssessmentDTO update(UUID id, AssessmentDTO request) {
        request.setId(id);
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(Assessment entity, AssessmentDTO request) {

        if (assessmentRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Assessment code already exists");
        }

        if (request.getAssessmentTypeId() == null) {
            throw new RuntimeException("AssessmentTypeId is required");
        }

        AssessmentType assessmentType = assessmentTypeRepository
                .findById(request.getAssessmentTypeId())
                .orElseThrow(() -> new RuntimeException("AssessmentType not found"));

        entity.setAssessmentType(assessmentType);
    }

    @Override
    protected void beforeUpdate(Assessment entity, AssessmentDTO request) {

        if (request.getAssessmentTypeId() != null) {

            AssessmentType assessmentType = assessmentTypeRepository
                    .findById(request.getAssessmentTypeId())
                    .orElseThrow(() -> new RuntimeException("AssessmentType not found"));

            entity.setAssessmentType(assessmentType);
        }

        if (request.getTitle() != null) {
            entity.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }

        if (request.getDifficulty() != null) {
            entity.setDifficulty(request.getDifficulty());
        }

        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        if (request.getTimeLimitMinutes() != null) {
            entity.setTimeLimitMinutes(request.getTimeLimitMinutes());
        }

        if (request.getPassScore() != null) {
            entity.setPassScore(request.getPassScore());
        }

        if (request.getAttemptLimit() != null) {
            entity.setAttemptLimit(request.getAttemptLimit());
        }
    }
}
