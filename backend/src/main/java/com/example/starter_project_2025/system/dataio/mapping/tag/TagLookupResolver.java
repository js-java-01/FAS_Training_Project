package com.example.starter_project_2025.system.dataio.mapping.tag;

import com.example.starter_project_2025.system.assessment.entity.Tag;
import com.example.starter_project_2025.system.assessment.repository.TagRepository;
import com.example.starter_project_2025.system.dataio.core.importer.resolver.LookupResolver;
import org.springframework.context.ApplicationContext;

import java.util.HashSet;
import java.util.Set;

public class TagLookupResolver implements LookupResolver {


    @Override
    public Object resolve(String cellValue, ApplicationContext context) {
        TagRepository repo = context.getBean(TagRepository.class);

        String[] tagNames = cellValue.split(",");

        Set<Tag> tags = new HashSet<>();

        for (String name : tagNames) {

            Tag tag = repo.findByName(name.trim());
            if(tag == null){
                throw new RuntimeException("Tag not found: " + name);
            }

            tags.add(tag);
        }

        return tags;
    }
}
