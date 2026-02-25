package com.example.starter_project_2025.system.dataio.importer.resolver;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class DefaultLookupResolver implements LookupResolver {

    @Override
    public Object resolve(String value, ApplicationContext ctx) {
        return value;
    }
}
