package com.example.starter_project_2025.system.dataio.core.importer.annotation;

import java.lang.annotation.*;

@Documented
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ImportHash {

    boolean hashDefault() default true;
}
