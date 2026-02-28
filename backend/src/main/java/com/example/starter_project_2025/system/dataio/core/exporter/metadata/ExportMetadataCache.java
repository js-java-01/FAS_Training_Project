package com.example.starter_project_2025.system.dataio.core.exporter.metadata;

import com.example.starter_project_2025.system.dataio.core.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExportMetadataCache {

    Map<Class<?>, List<ExportFieldMeta>> cache = new ConcurrentHashMap<>();

    public List<ExportFieldMeta> getMetadata(Class<?> clazz) {
        return cache.computeIfAbsent(clazz, this::scan);
    }

    private List<ExportFieldMeta> scan(Class<?> clazz) {

        List<ExportFieldMeta> metas = new ArrayList<>();

        for (Field field : clazz.getDeclaredFields()) {

            if (!field.isAnnotationPresent(ExportField.class))
                continue;

            ExportField ann = field.getAnnotation(ExportField.class);

            if (ann.ignore())
                continue;

            field.setAccessible(true);

            ExportValueExtractor extractor =
                    createExtractor(ann.extractor());

            metas.add(new ExportFieldMeta(
                    ann.name(),
                    field,
                    ann.dateFormat(),
                    ann.path(),
                    extractor
            ));
        }

        return metas.stream().toList();
    }

    private ExportValueExtractor createExtractor(
            Class<? extends ExportValueExtractor> clazz) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException("Cannot create extractor", e);
        }
    }
}
