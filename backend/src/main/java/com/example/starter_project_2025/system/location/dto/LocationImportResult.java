package com.example.starter_project_2025.system.location.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocationImportResult {

    private int total;
    private int success;
    private int failed;

    private List<String> errors = new ArrayList<>();

    public void addError(String error) {
        this.errors.add(error);
        this.failed++;
    }

    public void addSuccess() {
        this.success++;
    }

    public void merge(LocationImportResult other, String fileName) {
        if (other == null) {
            return;
        }

        this.total += other.getTotal();
        this.success += other.getSuccess();

        if (other.getErrors() != null) {
            for (String error : other.getErrors()) {
                this.errors.add("[" + fileName + "] " + error);
            }
        }
    }

}
