package com.example.starter_project_2025.system.dataio.core.exporter.annotation;

import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.DefaultExtractor;
import com.example.starter_project_2025.system.dataio.core.exporter.resolver.extractor.ExportValueExtractor;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExportField {

    String name();

    boolean ignore() default false;

    String dateFormat() default "";

    String path() default "";

    Class<? extends ExportValueExtractor> extractor()
            default DefaultExtractor.class;
}
