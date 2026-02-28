package com.example.starter_project_2025.system.classes.dto.response;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Data
@Setter
@Getter
public class TraineeDetailsResponse
{
    UUID id;
    String email;
    String firstName;
    String lastName;
    private UUID semesterID;
    private String semesterName;
}
