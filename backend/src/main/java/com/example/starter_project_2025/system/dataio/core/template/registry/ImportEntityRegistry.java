package com.example.starter_project_2025.system.dataio.core.template.registry;

import com.example.starter_project_2025.system.dataio.core.template.annotation.ImportEntity;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.reflections.Reflections;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImportEntityRegistry {

    Map<String, Class<?>> entityMap = new HashMap<>();

    public ImportEntityRegistry() {
        scanEntities();
    }

    private void scanEntities() {

        Reflections reflections = new Reflections("com.example");

        Set<Class<?>> entities =
                reflections.getTypesAnnotatedWith(ImportEntity.class);

        for (Class<?> clazz : entities) {
            ImportEntity annotation = clazz.getAnnotation(ImportEntity.class);
            entityMap.put(annotation.value().toLowerCase(), clazz);
        }
    }

    public Class<?> getEntity(String name) {
        return entityMap.get(name.toLowerCase());
    }

    public Set<String> getSupportedEntities() {
        return entityMap.keySet();
    }
}
