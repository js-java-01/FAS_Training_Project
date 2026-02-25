package com.example.starter_project_2025.system.dataio.importer.mapper;

import java.util.Map;

public interface ImportMapper<T> {

    T map(Map<String, String> rowData, Class<T> clazz);
}
