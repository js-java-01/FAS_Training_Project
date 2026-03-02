package com.example.starter_project_2025.system.training_program.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class SearchTrainingProgramRequest {

    private int page = 0;
    @Schema (example = "2")
    private int size = 20;
    @Schema (example = "[\"createdAt\",) \"desc\"]")
    private String[] sort = new String[]{"createdAt","desc"};
    private String keyword;
}