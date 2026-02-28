package com.example.starter_project_2025.system.dataio.mapping.questionOption;

import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.dataio.core.importer.resolver.LookupResolver;
import org.springframework.context.ApplicationContext;

import java.util.ArrayList;
import java.util.List;

public class QuestionOptionResolver implements LookupResolver {
    @Override
    public Object resolve(String cellValue, ApplicationContext context) {
        List<QuestionOption> options = new ArrayList<>();

        if (cellValue == null || cellValue.isBlank()) {
            return options;
        }

        String[] parts = cellValue.split(";");

        for (String part : parts) {

            String[] pair = part.trim().split("\\|");

            if (pair.length != 2) {
                throw new RuntimeException(
                        "Invalid option format: " + part +
                                ". Expected format: content|true/false"
                );
            }

            QuestionOption option = new QuestionOption();
            option.setContent(pair[0].trim());
            option.setCorrect(Boolean.parseBoolean(pair[1].trim()));

            options.add(option);
        }

        return options;
    }
}
