package com.example.starter_project_2025.system.dataio.exporter.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Exportable {

    String fileName() default "export";

    String sheetName() default "Sheet1";
}
