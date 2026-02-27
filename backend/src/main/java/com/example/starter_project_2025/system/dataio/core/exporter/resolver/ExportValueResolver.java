package com.example.starter_project_2025.system.dataio.core.exporter.resolver;

import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.DefaultExtractor;
import com.example.starter_project_2025.system.dataio.core.exporter.metadata.ExportFieldMeta;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class ExportValueResolver {

    public Object resolve(Object source, ExportFieldMeta meta) {

        if (!(meta.extractor() instanceof DefaultExtractor)) {
            return meta.extractor().extract(source);
        }

        Object value = readValue(source, meta);

        if (value == null)
            return "";

        if (value instanceof Enum<?> e)
            return e.name();

        if (value instanceof LocalDateTime dt &&
                !meta.dateFormat().isBlank()) {
            return dt.format(DateTimeFormatter.ofPattern(meta.dateFormat()));
        }

        return value.toString();
    }

    private Object readValue(Object source, ExportFieldMeta meta) {

        try {
            Object value = meta.field().get(source);

            if (!meta.path().isBlank()) {
                return resolveNested(value, meta.path());
            }

            return value;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Object resolveNested(Object obj, String path) throws Exception {

        String[] parts = path.split("\\.");

        Object current = obj;

        for (String part : parts) {
            if (current == null) return null;

            Field f = current.getClass().getDeclaredField(part);
            f.setAccessible(true);
            current = f.get(current);
        }

        return current;
    }
}
