package com.example.starter_project_2025.system.modulegroups.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Pagination {
    private int page;
    private int pageSize;
    private long totalElements;
    private int totalPages;
}