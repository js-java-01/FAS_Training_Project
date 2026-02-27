package com.example.starter_project_2025.system.dataio.exporter.builder;

import com.example.starter_project_2025.system.dataio.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.exporter.component.ExportColumn;
import com.example.starter_project_2025.system.dataio.exporter.component.ExportSheetConfig;
import com.example.starter_project_2025.system.dataio.exporter.metadata.ExportFieldMeta;
import com.example.starter_project_2025.system.dataio.exporter.metadata.ExportMetadataCache;
import com.example.starter_project_2025.system.dataio.exporter.resolver.ExportValueResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ExportConfigBuilder {

    private final ExportMetadataCache cache;
    private final ExportValueResolver resolver;

    public <T> ExportSheetConfig<T> build(Class<T> clazz) {

        ExportEntity meta = clazz.getAnnotation(ExportEntity.class);

        if (meta == null) {
            throw new IllegalStateException(
                    "Missing @Exportable on " + clazz.getName());
        }

        List<ExportFieldMeta> fields = cache.getMetadata(clazz);

        List<ExportColumn<T>> columns = fields.stream()
                .map(f -> new ExportColumn<T>(
                        f.header(),
                        obj -> resolver.resolve(obj, f)
                ))
                .toList();

        return new ExportSheetConfig<>(
                meta.sheetName(),
                columns
        );
    }
}
