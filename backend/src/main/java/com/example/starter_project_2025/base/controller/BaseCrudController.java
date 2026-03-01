package com.example.starter_project_2025.base.controller;

import com.example.starter_project_2025.base.service.CrudService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public abstract class BaseCrudController<ID, R, C, U, F> {

    protected abstract CrudService<ID, R, C, U, F> getService();

    @GetMapping
    public ResponseEntity<Page<R>> getAll(
            @PageableDefault Pageable pageable,
            @RequestParam(required = false) String search,
            @ModelAttribute F filter
    ) {
        return ResponseEntity.ok(
                getService().getAll(pageable, search, filter)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<R> getById(
            @PathVariable ID id
    ) {
        return ResponseEntity.ok(getService().getById(id));
    }

    @PostMapping
    public ResponseEntity<R> create(
            @Valid @RequestBody C req
    ) {
        return ResponseEntity.ok(getService().create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<R> update(
            @PathVariable ID id,
            @Valid @RequestBody U req
    ) {
        return ResponseEntity.ok(getService().update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable ID id
    ) {
        getService().delete(id);
        return ResponseEntity.noContent().build();
    }
}
