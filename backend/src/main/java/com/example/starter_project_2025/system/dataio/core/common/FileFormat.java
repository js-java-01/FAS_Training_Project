package com.example.starter_project_2025.system.dataio.core.common;

public enum FileFormat {

    EXCEL("xlsx"),
    CSV("csv"),
    PDF("pdf");

    private final String extension;

    FileFormat(String extension) {
        this.extension = extension;
    }

    public String extension() {
        return extension;
    }
}
