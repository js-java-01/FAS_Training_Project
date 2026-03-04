<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_tag/QuestionTag.java
package com.example.starter_project_2025.system.assessment.question_tag;


import com.example.starter_project_2025.system.assessment.question.Question;
import com.example.starter_project_2025.system.dataio.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.system.dataio.exporter.annotation.ExportField;
import com.example.starter_project_2025.system.dataio.importer.annotation.ImportField;
import com.example.starter_project_2025.system.dataio.template.annotation.ImportEntity;
========
package com.example.starter_project_2025.system.assessment_mgt.question_tag;


import com.example.starter_project_2025.system.assessment_mgt.question.Question;
import com.example.starter_project_2025.base.dataio.exporter.annotation.ExportEntity;
import com.example.starter_project_2025.base.dataio.exporter.annotation.ExportField;
import com.example.starter_project_2025.base.dataio.importer.annotation.ImportField;
import com.example.starter_project_2025.base.dataio.template.annotation.ImportEntity;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_tag/QuestionTag.java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "tag")
@ImportEntity("question_tags")
@ExportEntity(fileName = "question_tags", sheetName = "tags")
public class QuestionTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    @ImportField(name = "name", required = true)
    @ExportField(name = "name")
    String name;

    @ImportField(name = "description")
    @ExportField(name = "description")
    String description;

    @ManyToMany(mappedBy = "tags")
    @JsonIgnoreProperties({"tags"})
    Set<Question> questions = new HashSet<>();
}


