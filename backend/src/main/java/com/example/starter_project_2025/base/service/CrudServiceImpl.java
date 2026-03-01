package com.example.starter_project_2025.base.service;

import com.example.starter_project_2025.base.mapper.BaseMapper;
import com.example.starter_project_2025.base.repository.BaseRepository;
import com.example.starter_project_2025.base.spec.AutoSpecBuilder;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

@Transactional
public abstract class CrudServiceImpl<E, ID, R, C, U, F> implements CrudService<ID, R, C, U, F> {

    @Autowired
    protected  AutoSpecBuilder autoSpecBuilder;

    protected abstract BaseRepository<E, ID> getRepository();
    protected abstract BaseMapper<E, R, C, U> getMapper();
    protected abstract String[] searchableFields();

    protected void beforeCreate(E entity, C request) {}
    protected void afterCreate(E entity, C request) {}

    protected void beforeUpdate(E entity, U request) {}
    protected void afterUpdate(E entity, U request) {}

    protected void beforeDelete(E entity) {}
    protected void afterDelete(E entity) {}

    protected R createEntity(C request) {

        E entity = getMapper().toEntity(request);

        beforeCreate(entity, request);

        E saved = getRepository().save(entity);

        afterCreate(saved, request);

        return getMapper().toResponse(saved);
    }

    protected R updateEntity(ID id, U request) {

        E entity = getRepository().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entity not found"));

        beforeUpdate(entity, request);

        getMapper().update(entity, request);

        E saved = getRepository().save(entity);

        afterUpdate(saved, request);

        return getMapper().toResponse(saved);
    }

    protected void deleteEntity(ID id) {

        E entity = getRepository().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entity not found"));

        beforeDelete(entity);

        getRepository().delete(entity);

        afterDelete(entity);
    }

    protected R getByIdEntity(ID id) {
        return getRepository().findById(id)
                .map(getMapper()::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Entity not found"));
    }

    protected Page<R> getAllEntity(Pageable pageable,String search, F filter) {

        Specification<E> spec = Specification.where(null);

        Specification<E> filterSpec = autoSpecBuilder.build(filter);
        Specification<E> searchSpec = buildSearchSpec(search);

        if (filterSpec != null) spec = spec.and(filterSpec);
        if (searchSpec != null) spec = spec.and(searchSpec);

        return getRepository().findAll(spec, pageable)
                .map(getMapper()::toResponse);
    }

    private Specification<E> buildSearchSpec(String keyword) {

        if (keyword == null || keyword.isBlank()) return null;

        String likePattern = "%" + keyword.toLowerCase() + "%";

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            for (String field : searchableFields()) {

                try {
                    var path = root.get(field);
                    if (!String.class.equals(path.getJavaType())) {
                        continue;
                    }
                    predicates.add(cb.like(cb.lower(path.as(String.class)), likePattern));

                } catch (IllegalArgumentException ex) {
                    throw new RuntimeException("Invalid searchable field: " + field, ex);
                }
            }

            if (predicates.isEmpty()) {
                return null;
            }

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
}
