package com.example.starter_project_2025.system.assessment.service.assessment_type;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment.dto.assessment_type.AssessmentTypeDTO;
import com.example.starter_project_2025.system.assessment.dto.assessment_type.AssessmentTypeFilter;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.mapper.AssessmentTypeMapper;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AssessmentTypeServiceImpl
        extends CrudServiceImpl<AssessmentType, UUID, AssessmentTypeDTO, AssessmentTypeFilter>
        implements AssessmentTypeService {

     AssessmentTypeMapper assessmentTypeMapper;
     AssessmentTypeRepository assessmentTypeRepository;

    @Override
    protected BaseCrudRepository<AssessmentType, UUID> getRepository() {
        return assessmentTypeRepository;
    }

    @Override
    protected BaseCrudMapper<AssessmentType, AssessmentTypeDTO> getMapper() {
        return assessmentTypeMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"name","description"};
    }

    @Override
    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public Page<AssessmentTypeDTO> getAll(Pageable pageable, String search, AssessmentTypeFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    @PreAuthorize("hasAuthority('ASSESSMENT_READ')")
    public AssessmentTypeDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    @PreAuthorize("hasAuthority('ASSESSMENT_CREATE')")
    public AssessmentTypeDTO create(AssessmentTypeDTO request) {
        return super.createEntity(request);
    }

    @Override
    @PreAuthorize("hasAuthority('ASSESSMENT_UPDATE')")
    public AssessmentTypeDTO update(UUID id, AssessmentTypeDTO request) {
        return super.updateEntity(request.getId(), request);
    }

    @Override
    @PreAuthorize("hasAuthority('ASSESSMENT_DELETE')")
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(AssessmentType assessment, AssessmentTypeDTO request) {
        if (assessmentTypeRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment name already exists");
        }
    }

    @Override
    protected void beforeUpdate(AssessmentType assessment, AssessmentTypeDTO request) {
        if (assessmentTypeRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment name already exists");
        }
    }
}
