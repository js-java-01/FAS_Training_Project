package com.example.starter_project_2025.system.dataio.importer.mapper;

import com.example.starter_project_2025.system.dataio.importer.annotation.ImportDefault;
import com.example.starter_project_2025.system.dataio.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.importer.resolver.RelationLookupEngine;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenericImportMapper<T> implements ImportMapper<T> {

    RelationLookupEngine relationEngine;

    @Override
    public T map(Map<String, String> rowData, Class<T> clazz) {

        try {
            T entity = clazz.getDeclaredConstructor().newInstance();

            for (Field field : clazz.getDeclaredFields()) {

                field.setAccessible(true);

                ImportField meta = field.getAnnotation(ImportField.class);
                ImportDefault def = field.getAnnotation(ImportDefault.class);

                if (meta == null) {
                    applyDefault(entity, field, def);
                    continue;
                }

                String raw = rowData.get(meta.name());

                if (meta.required() && isBlank(raw))
                    throw new RuntimeException("Missing field: " + meta.name());

                // Default handling
                if (isBlank(raw) && def != null) {
                    field.set(entity, convert(field.getType(), def.value()));
                    continue;
                }

                Object value;

                // 🔥 RELATION AUTO RESOLVE
                if (meta.relation()) {
                    value = relationEngine.resolve(raw, field, meta);
                } else {
                    value = convert(field.getType(), raw);
                }

                field.set(entity, value);
            }

            return entity;

        } catch (Exception e) {
            throw new RuntimeException(getRootMessage(e), e);
        }
    }

    private void applyDefault(Object entity, Field field, ImportDefault def)
            throws Exception {

        if (def == null) return;

        field.set(entity, convert(field.getType(), def.value()));
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private Object convert(Class<?> type, Object value) {

        if (value == null) return null;

        String val = value.toString();

        if (type == String.class) return val;
        if (type == Long.class || type == long.class) return Long.valueOf(val);
        if (type == Integer.class || type == int.class) return Integer.valueOf(val);
        if (type == Boolean.class || type == boolean.class) return Boolean.valueOf(val);
        if (type == Double.class || type == double.class) return Double.valueOf(val);

        return value;
    }

    private String getRootMessage(Throwable e) {
        Throwable root = e;
        while (root.getCause() != null) root = root.getCause();
        return root.getMessage();
    }
}
