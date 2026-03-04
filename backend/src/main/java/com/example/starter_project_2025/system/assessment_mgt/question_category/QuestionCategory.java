<<<<<<<< HEAD:backend/src/main/java/com/example/starter_project_2025/system/assessment/question_category/QuestionCategory.java
package com.example.starter_project_2025.system.assessment.question_category;
========
package com.example.starter_project_2025.system.assessment_mgt.question_category;
>>>>>>>> 969201241eddad103d8fabc8223f98735ac13075:backend/src/main/java/com/example/starter_project_2025/system/assessment_mgt/question_category/QuestionCategory.java

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data // Cái này để tự sinh Getter/Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties({ "handler", "hibernateLazyInitializer" })
@Table(name = "question_categories")
public class QuestionCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true)
    String name;

    String description;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}