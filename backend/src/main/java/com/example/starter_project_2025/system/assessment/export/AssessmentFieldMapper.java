package com.example.starter_project_2025.system.assessment.export;

import com.example.starter_project_2025.system.assessment.dto.ExportPreviewResponse;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class AssessmentFieldMapper {

    private static final List<ExportPreviewResponse.FieldInfo> FIELDS = Arrays.asList(
            new ExportPreviewResponse.FieldInfo("id", "ID", "string", false),
            new ExportPreviewResponse.FieldInfo("name", "Name", "string", true),
            new ExportPreviewResponse.FieldInfo("description", "Description", "string", true),
            new ExportPreviewResponse.FieldInfo("createdAt", "Created Date", "datetime", false),
            new ExportPreviewResponse.FieldInfo("updatedAt", "Updated Date", "datetime", false));

    public List<ExportPreviewResponse.FieldInfo> getAvailableFields() {
        return FIELDS;
    }

    public List<String> getAllFieldNames() {
        return FIELDS.stream()
                .map(ExportPreviewResponse.FieldInfo::getName)
                .collect(Collectors.toList());
    }

    public List<String> validateFields(List<String> fields) {
        if (fields == null || fields.isEmpty()) {
            return Collections.emptyList();
        }
        return fields.stream()
                .filter(f -> getAllFieldNames().contains(f))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> toMapList(List<AssessmentType> entities, List<String> fields) {
        return entities.stream()
                .map(entity -> toMap(entity, fields))
                .collect(Collectors.toList());
    }

    private Map<String, Object> toMap(AssessmentType entity, List<String> fields) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (String field : fields) {
            switch (field) {
                case "id":
                    map.put("id", entity.getId());
                    break;
                case "name":
                    map.put("name", entity.getName());
                    break;
                case "description":
                    map.put("description", entity.getDescription());
                    break;
                case "createdAt":
                    map.put("createdAt", entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : "");
                    break;
                case "updatedAt":
                    map.put("updatedAt", entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : "");
                    break;
            }
        }
        return map;
    }
}
