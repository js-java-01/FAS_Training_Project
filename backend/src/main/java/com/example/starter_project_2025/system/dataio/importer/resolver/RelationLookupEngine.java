package com.example.starter_project_2025.system.dataio.importer.resolver;

import com.example.starter_project_2025.system.dataio.importer.annotation.ImportField;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RelationLookupEngine {

    ApplicationContext ctx;

    public Object resolve(String raw, Field field, ImportField meta) {

        if (raw == null || raw.isBlank())
            return null;

        JpaRepository repo = getRepository(meta.lookupEntity());

        if (Collection.class.isAssignableFrom(field.getType())) {

            List<Object> result = new ArrayList<>();

            for (String val : raw.split(meta.separator())) {

                Object entity = findEntity(repo, meta.lookupField(), val.trim());

                result.add(entity);
            }

            return result;
        }

        // Single relation
        return findEntity(repo, meta.lookupField(), raw.trim());
    }

    private Object findEntity(JpaRepository repo, String field, String value) {

        try {
            String methodName =
                    "findBy" + capitalize(field);

            Method method = repo.getClass()
                    .getMethod(methodName, String.class);

            Object result = method.invoke(repo, value);

            if (result == null)
                throw new RuntimeException("Entity not found: " + value);

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Lookup failed for value: " + value, e);
        }
    }

    private JpaRepository getRepository(Class<?> entityClass) {

        String beanName =
                Character.toLowerCase(entityClass.getSimpleName().charAt(0))
                        + entityClass.getSimpleName().substring(1)
                        + "Repository";

        return ctx.getBean(beanName, JpaRepository.class);
    }

    private String capitalize(String s) {
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
