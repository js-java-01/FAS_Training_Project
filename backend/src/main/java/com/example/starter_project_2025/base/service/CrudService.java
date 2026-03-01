package com.example.starter_project_2025.base.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrudService<ID, R, C, U, F> {

    Page<R> getAll(Pageable pageable, String search, F filter);

    R getById(ID id);

    R create(C request);

    R update(ID id, U request);

    void delete(ID id);
}
