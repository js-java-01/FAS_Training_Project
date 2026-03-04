package com.example.starter_project_2025.system.assessment.question_category;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
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
public class QuestionCategoryServiceImpl
        extends CrudServiceImpl<QuestionCategory, UUID, QuestionCategoryDTO, QuestionCategoryFilter>
        implements QuestionCategoryService {

    QuestionCategoryRepository questionCategoryRepository;
    QuestionCategoryMapper questionCategoryMapper;


    @Override
    protected BaseCrudRepository<QuestionCategory, UUID> getRepository() {
        return questionCategoryRepository;
    }

    @Override
    protected BaseCrudMapper<QuestionCategory, QuestionCategoryDTO> getMapper() {
        return questionCategoryMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"name", "description"};
    }

    @Override
    public Page<QuestionCategoryDTO> getAll(Pageable pageable, String search, QuestionCategoryFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public QuestionCategoryDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public QuestionCategoryDTO create(QuestionCategoryDTO request) {
        return super.createEntity(request);
    }

    @Override
    public QuestionCategoryDTO update(UUID id, QuestionCategoryDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(QuestionCategory entity, QuestionCategoryDTO request) {
        if (questionCategoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Tag name already exists");
        }
    }

    @Override
    protected void beforeUpdate(QuestionCategory entity, QuestionCategoryDTO request) {

        if (request.getName() != null
                && !entity.getName().equalsIgnoreCase(request.getName())
                && questionCategoryRepository.existsByNameIgnoreCase(request.getName())) {

            throw new RuntimeException("Tag name already exists");
        }

        if (request.getName() != null) {
            entity.setName(request.getName());
        }

        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
    }



//    public List<QuestionCategory> getAll() {
//        return repository.findAll();
//    }
//
//    public QuestionCategory create(QuestionCategoryDTO dto) {
//        QuestionCategory entity = new QuestionCategory();
//        entity.setName(dto.getName());
//        entity.setDescription(dto.getDescription());
//        return repository.save(entity);
//    }
//
//    public void deleteById(UUID id) {
//        repository.deleteById(id);
//    }
//
//    public QuestionCategory getById(UUID id) {
//        return repository.findById(id).orElseThrow(() -> new RuntimeException("QuestionCategory not found"));
//    }
}