package com.example.starter_project_2025.system.dataio.core.importer.service;

import com.example.starter_project_2025.system.common.hash.HashService;
import com.example.starter_project_2025.system.dataio.core.importer.annotation.ImportHash;
import com.example.starter_project_2025.system.dataio.core.importer.mapper.GenericImportMapper;
import com.example.starter_project_2025.system.dataio.core.importer.parser.FileParser;
import com.example.starter_project_2025.system.dataio.core.importer.parser.ParserFactory;
import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.core.importer.result.RowError;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenericImportService implements ImportService {

    ParserFactory parserFactory;
    GenericImportMapper mapper;
    HashService hashService;

    @Override
    public <T> ImportResult importFile(
            MultipartFile file,
            Class<T> entityClass,
            JpaRepository<T, UUID> repository
    ) {

        ImportResult result = new ImportResult();

        try {
            FileParser parser = parserFactory.getParser(file.getOriginalFilename());

            List<Map<String, String>> rows =
                    parser.parse(file.getInputStream());

            int rowIndex = 2;

            for (Map<String, String> row : rows) {

                try {
                    T entity = (T) mapper.map(row, entityClass);

                    applyImportHash(entity);

                    handleBidirectionalRelations(entity);

                    repository.save(entity);

                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception e) {

                    String message = resolveErrorMessage(e);

                    result.getErrors().add(
                            new RowError(rowIndex, message)
                    );

                    result.setFailureCount(result.getFailureCount() + 1);
                }

                rowIndex++;
            }

        } catch (Exception e) {
            throw new RuntimeException("Import failed: " + e.getMessage(), e);
        }

        return result;
    }

    private void applyImportHash(Object entity) throws IllegalAccessException {

        Field[] fields = entity.getClass().getDeclaredFields();

        for (Field field : fields) {

            ImportHash annotation = field.getAnnotation(ImportHash.class);
            if (annotation == null) continue;

            field.setAccessible(true);

            Object value = field.get(entity);

            if (value == null) continue;

            if (!(value instanceof String raw)) continue;

            // tránh hash double
            if (isAlreadyHashed(raw)) continue;

            String hashed = hashService.hash(raw);

            field.set(entity, hashed);
        }
    }

    private boolean isAlreadyHashed(String value) {
        return value.startsWith("$2a$")
                || value.startsWith("$2b$")
                || value.startsWith("$2y$");
    }

    private void handleBidirectionalRelations(Object entity) {

        Field[] fields = entity.getClass().getDeclaredFields();

        for (Field field : fields) {
            field.setAccessible(true);

            try {
                Object value = field.get(entity);

                if (!(value instanceof Collection<?> collection)) continue;

                for (Object child : collection) {
                    setParentReference(child, entity);
                }

            } catch (Exception ignored) {
            }
        }
    }

    private void setParentReference(Object child, Object parent) {

        Field[] childFields = child.getClass().getDeclaredFields();

        for (Field childField : childFields) {

            if (!childField.getType().equals(parent.getClass())) continue;

            try {
                childField.setAccessible(true);
                childField.set(child, parent);
                return;

            } catch (Exception ignored) {
            }
        }
    }

    private String resolveErrorMessage(Throwable e) {

        Throwable root = getRootCause(e);

        if (root instanceof DataIntegrityViolationException
                || root.getMessage().contains("Duplicate entry")) {

            return extractDuplicateMessage(root.getMessage());
        }

        return root.getMessage();
    }

    private Throwable getRootCause(Throwable e) {
        Throwable root = e;
        while (root.getCause() != null) root = root.getCause();
        return root;
    }

    private String extractDuplicateMessage(String msg) {

        try {
            int start = msg.indexOf("'");
            int end = msg.indexOf("'", start + 1);

            String value = msg.substring(start + 1, end);

            return "Duplicate value: " + value;

        } catch (Exception e) {
            return "Duplicate record";
        }
    }
}
