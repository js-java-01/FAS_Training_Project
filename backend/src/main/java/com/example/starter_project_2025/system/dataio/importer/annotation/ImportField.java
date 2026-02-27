package com.example.starter_project_2025.system.dataio.importer.annotation;

import com.example.starter_project_2025.system.dataio.importer.resolver.DefaultLookupResolver;
import com.example.starter_project_2025.system.dataio.importer.resolver.LookupResolver;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ImportField {

    String name();

    boolean required() default false;

    Class<? extends LookupResolver> resolver()
            default DefaultLookupResolver.class;
}
