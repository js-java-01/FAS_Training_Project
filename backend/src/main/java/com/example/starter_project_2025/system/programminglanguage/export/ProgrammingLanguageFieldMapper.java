package com.example.starter_project_2025.system.programminglanguage.export;

import com.example.starter_project_2025.system.programminglanguage.dto.ExportPreviewResponse.FieldInfo;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.Function;

/**
 * Explicit whitelist mapping for exportable fields.
 * 
 * This approach is safer than reflection as it:
 * - Only exposes explicitly allowed fields
 * - Controls how each field is formatted
 * - Provides metadata (labels, types) for the UI
 */
@Component
public class ProgrammingLanguageFieldMapper {

    /**
     * Whitelist of exportable fields with their extractors.
     * Key: field name, Value: function to extract value from entity
     */
    private static final Map<String, Function<ProgrammingLanguage, Object>> FIELD_EXTRACTORS;

    /**
     * Field metadata for UI display.
     */
    private static final List<FieldInfo> AVAILABLE_FIELDS;

    static {
        // Define extractable fields (whitelist)
        FIELD_EXTRACTORS = new LinkedHashMap<>();
        FIELD_EXTRACTORS.put("id", ProgrammingLanguage::getId);
        FIELD_EXTRACTORS.put("name", ProgrammingLanguage::getName);
        FIELD_EXTRACTORS.put("version", ProgrammingLanguage::getVersion);
        FIELD_EXTRACTORS.put("description", ProgrammingLanguage::getDescription);
        FIELD_EXTRACTORS.put("isSupported", ProgrammingLanguage::getSupported);

        // Define field metadata for UI
        AVAILABLE_FIELDS = List.of(
                new FieldInfo("id", "ID", "number", true),
                new FieldInfo("name", "Name", "string", true),
                new FieldInfo("version", "Version", "string", true),
                new FieldInfo("description", "Description", "string", true),
                new FieldInfo("isSupported", "Is Supported", "boolean", true)
        );
    }

    /**
     * Returns metadata about all available exportable fields.
     */
    public List<FieldInfo> getAvailableFields() {
        return AVAILABLE_FIELDS;
    }

    /**
     * Returns list of all field names.
     */
    public List<String> getAllFieldNames() {
        return new ArrayList<>(FIELD_EXTRACTORS.keySet());
    }

    /**
     * Validates that requested fields are in the whitelist.
     *
     * @param requestedFields Fields requested for export
     * @return List of valid field names (filters out invalid ones)
     */
    public List<String> validateFields(List<String> requestedFields) {
        if (requestedFields == null || requestedFields.isEmpty()) {
            return getAllFieldNames();
        }
        return requestedFields.stream()
                .filter(FIELD_EXTRACTORS::containsKey)
                .toList();
    }

    /**
     * Converts an entity to a map containing only the selected fields.
     *
     * @param entity The entity to convert
     * @param selectedFields Fields to include (must be validated first)
     * @return Map of field name to value
     */
    public Map<String, Object> toMap(ProgrammingLanguage entity, List<String> selectedFields) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (String field : selectedFields) {
            Function<ProgrammingLanguage, Object> extractor = FIELD_EXTRACTORS.get(field);
            if (extractor != null) {
                map.put(field, extractor.apply(entity));
            }
        }
        return map;
    }

    /**
     * Converts a list of entities to a list of maps.
     *
     * @param entities Entities to convert
     * @param selectedFields Fields to include
     * @return List of maps
     */
    public List<Map<String, Object>> toMapList(
            List<ProgrammingLanguage> entities, 
            List<String> selectedFields
    ) {
        return entities.stream()
                .map(entity -> toMap(entity, selectedFields))
                .toList();
    }
}
