package com.example.starter_project_2025.system.dataio.importer.resolver;


import org.springframework.context.ApplicationContext;

public interface LookupResolver {

    Object resolve(String cellValue, ApplicationContext context);
}
