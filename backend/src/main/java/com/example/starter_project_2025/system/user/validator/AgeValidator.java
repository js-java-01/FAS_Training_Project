package com.example.starter_project_2025.system.user.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

public class AgeValidator implements ConstraintValidator<AgeBetween, LocalDate> {

    private int min;
    private int max;

    @Override
    public void initialize(AgeBetween constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
    }

    @Override
    public boolean isValid(LocalDate dob, ConstraintValidatorContext context) {
        if (dob == null) return true; // @NotNull xử lý
        int age = Period.between(dob, LocalDate.now()).getYears();
        return age >= min && age <= max;
    }
}

