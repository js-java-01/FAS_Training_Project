package com.example.starter_project_2025.system.assessment.service.question_tag;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment.dto.question_tag.QuestionTagDTO;
import com.example.starter_project_2025.system.assessment.dto.question_tag.QuestionTagFilter;
import com.example.starter_project_2025.system.assessment.entity.QuestionTag;
import com.example.starter_project_2025.system.assessment.mapper.QuestionTagMapper;
import com.example.starter_project_2025.system.assessment.repository.QuestionTagRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionTagServiceImpl
        extends CrudServiceImpl<QuestionTag, Long, QuestionTagDTO, QuestionTagFilter>
        implements QuestionTagService {

    QuestionTagRepository questionTagRepository;
    QuestionTagMapper questionTagMapper;

    @Override
    protected BaseCrudRepository<QuestionTag, Long> getRepository() {
        return questionTagRepository;
    }

    @Override
    protected BaseCrudMapper<QuestionTag, QuestionTagDTO> getMapper() {
        return questionTagMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"name" , "description"};
    }

    @Override
    public Page<QuestionTagDTO> getAll(Pageable pageable, String search, QuestionTagFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public QuestionTagDTO getById(Long id) {
        return super.getByIdEntity(id);
    }

    @Override
    public QuestionTagDTO create(QuestionTagDTO request) {
        return super.createEntity(request);
    }

    @Override
    public QuestionTagDTO update(Long id, QuestionTagDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(Long id) {
        super.deleteEntity(id);
    }

    @Override
    protected void beforeCreate(QuestionTag questionTag, QuestionTagDTO request) {
        if (questionTagRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Tag name already exists");
        }
    }

    @Override
    protected void beforeUpdate(QuestionTag questionTag, QuestionTagDTO request) {
        if (request.getName() != null) {
            if (questionTagRepository.existsByNameIgnoreCase(request.getName())
                    && !questionTag.getName().equalsIgnoreCase(request.getName())) {
                throw new RuntimeException("Tag name already exists");
            }
            questionTag.setName(request.getName());
        }

        if (request.getDescription() != null) {
            questionTag.setDescription(request.getDescription());
        }
    }


//    @Override
//    public List<TagCountResponse> getTagsByCategory(UUID categoryId) {
//        return tagRepository.findTagsByCategoryWithCount(categoryId);
//    }
}
