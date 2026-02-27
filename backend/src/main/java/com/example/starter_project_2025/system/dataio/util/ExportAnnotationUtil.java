package com.example.starter_project_2025.system.dataio.util;

import com.example.starter_project_2025.system.dataio.exporter.annotation.ExportEntity;

public class ExportAnnotationUtil {

    public static ExportEntity getExportEntity(Class<?> clazz) {
        return clazz.getAnnotation(ExportEntity.class);
    }
}
