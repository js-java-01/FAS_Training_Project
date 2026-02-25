package com.example.starter_project_2025.system.dataio.importer.mapper;

import com.example.starter_project_2025.system.dataio.importer.components.ImportColumn;
import com.example.starter_project_2025.system.dataio.importer.components.ImportDefault;
import com.example.starter_project_2025.system.dataio.importer.resolver.LookupResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GenericImportMapper<T> implements ImportMapper<T> {

    private final ApplicationContext context;

    @Override
    public T map(Map<String, String> rowData, Class<T> clazz) {
        try {
            T entity = clazz.getDeclaredConstructor().newInstance();

            for (Field field : clazz.getDeclaredFields()) {

                field.setAccessible(true);

                ImportColumn col = field.getAnnotation(ImportColumn.class);
                ImportDefault def = field.getAnnotation(ImportDefault.class);

                if (col == null) {
                    applyDefaultIfPresent(entity, field, def);
                    continue;
                }

                String rawValue = rowData.get(col.header());

                if (col.required() && (rawValue == null || rawValue.isBlank())) {
                    throw new RuntimeException("Missing required field: " + col.header());
                }

                if ((rawValue == null || rawValue.isBlank()) && def != null) {
                    field.set(entity, convert(field.getType(), def.value()));
                    continue;
                }

                LookupResolver resolver = context.getBean(col.resolver());
                Object resolved = resolver.resolve(rawValue, context);

                if (Collection.class.isAssignableFrom(field.getType())) {
                    field.set(entity, resolved);
                    continue;
                }

                field.set(entity, convert(field.getType(), resolved));
            }

            return entity;

        } catch (Exception e) {
            throw new RuntimeException(getRootMessage(e), e);
        }
    }

    private void applyDefaultIfPresent(Object entity, Field field, ImportDefault def) throws Exception {
        if (def == null) return;

        Object defaultValue = convert(field.getType(), def.value());
        field.set(entity, defaultValue);
    }

    private Object convert(Class<?> type, Object value) {

        if (value == null) return null;

        String val = value.toString();

        if (type.equals(String.class)) return val;
        if (type.equals(Long.class) || type.equals(long.class)) return Long.valueOf(val);
        if (type.equals(Integer.class) || type.equals(int.class)) return Integer.valueOf(val);
        if (type.equals(Boolean.class) || type.equals(boolean.class)) return Boolean.valueOf(val);
        if (type.equals(Double.class) || type.equals(double.class)) return Double.valueOf(val);

        return value;
    }

    private String getRootMessage(Throwable e) {
        Throwable root = e;
        while (root.getCause() != null) root = root.getCause();
        return root.getMessage();
    }
}
