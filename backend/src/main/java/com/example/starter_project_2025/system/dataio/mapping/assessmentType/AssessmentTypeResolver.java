package com.example.starter_project_2025.system.dataio.mapping.assessmentType;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.dataio.core.importer.resolver.LookupResolver;
import org.springframework.context.ApplicationContext;

import java.util.Optional;

public class AssessmentTypeResolver implements LookupResolver {
    @Override
    public Object resolve(String cellValue, ApplicationContext context) {
        if (cellValue == null || cellValue.isBlank()) {
            return null;
        }

        AssessmentTypeRepository repo =
                context.getBean(AssessmentTypeRepository.class);

        Optional<AssessmentType> type = repo.findByName(cellValue.trim());

        if (type == null) {
            throw new RuntimeException("AssessmentType not found: " + cellValue);
        }

        return type;
    }
}
