package com.example.starter_project_2025.system.dataio.mapping.question;

import com.example.starter_project_2025.system.assessment.repository.QuestionCategoryRepository;
import com.example.starter_project_2025.system.dataio.core.importer.resolver.LookupResolver;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class QuestionCategoryLookupResolver implements LookupResolver {

    @Override
    public Object resolve(String cellValue, ApplicationContext context) {

        QuestionCategoryRepository repo =
                context.getBean(QuestionCategoryRepository.class);

        return repo.findByName(cellValue.trim())
                .orElseThrow(() ->
                        new RuntimeException("Category not found: " + cellValue));
    }
}
