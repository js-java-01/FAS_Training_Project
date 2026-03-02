package com.example.starter_project_2025.system.programminglanguage.service;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.system.common.error.ErrorUtil;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageDTO;
import com.example.starter_project_2025.system.programminglanguage.dto.ProgrammingLanguageFilter;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.mapper.ProgrammingLanguageMapper;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProgrammingLanguageServiceImp
        extends CrudServiceImpl<ProgrammingLanguage, UUID, ProgrammingLanguageDTO, ProgrammingLanguageFilter>
        implements ProgrammingLanguageService {

    ProgrammingLanguageMapper mapper;
    ProgrammingLanguageRepository repository;

    // ================= BASE CONFIG =================

    @Override
    protected BaseCrudRepository<ProgrammingLanguage, UUID> getRepository() {
        return repository;
    }

    @Override
    protected BaseCrudMapper<ProgrammingLanguage, ProgrammingLanguageDTO> getMapper() {
        return mapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"name", "version", "description"};
    }

    // ================= BUSINESS HOOKS =================

    @Override
    protected void beforeCreate(ProgrammingLanguage entity, ProgrammingLanguageDTO request) {

        Map<String, List<String>> errors = new HashMap<>();

        validateNameUnique(request.getName(), null, errors);

        ErrorUtil.throwIfHasErrors(errors);

        // entity dùng primitive boolean → không null
        // default false nếu client không gửi
        entity.setSupported(
                request.getSupported() != null
                        ? request.getSupported()
                        : false
        );
    }

    @Override
    protected void beforeUpdate(ProgrammingLanguage entity, ProgrammingLanguageDTO request) {

        Map<String, List<String>> errors = new HashMap<>();

        if (request.getName() != null) {
            validateNameUnique(request.getName(), entity.getId(), errors);
        }

        ErrorUtil.throwIfHasErrors(errors);

        // chỉ update nếu client gửi field
        if (request.getSupported() != null) {
            entity.setSupported(request.getSupported());
        }
    }

    // ================= CRUD API WITH PERMISSION =================

    @Override
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public Page<ProgrammingLanguageDTO> getAll(Pageable pageable,
                                               String search,
                                               ProgrammingLanguageFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public ProgrammingLanguageDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_CREATE')")
    public ProgrammingLanguageDTO create(ProgrammingLanguageDTO request) {
        return super.createEntity(request);
    }

    @Override
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_UPDATE')")
    public ProgrammingLanguageDTO update(UUID id, ProgrammingLanguageDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_DELETE')")
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    // ================= VALIDATION =================

    private void validateNameUnique(String name,
                                    UUID currentId,
                                    Map<String, List<String>> errors) {

        if (name == null) return;

        Optional<ProgrammingLanguage> existing = repository.findByName(name);

        if (existing.isPresent()
                && (currentId == null || !existing.get().getId().equals(currentId))) {

            ErrorUtil.addError(errors, "name",
                    "Programming language name already exists");
        }
    }
}