package com.example.demo.orthanc.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DicomTagValidator implements ConstraintValidator<ValidDicomTag, String> {

    @Override
    public void initialize(ValidDicomTag constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // null values are handled by @NotNull annotation
        }
        return value.matches("^[0-9A-Fa-f]{8}$");
    }
}