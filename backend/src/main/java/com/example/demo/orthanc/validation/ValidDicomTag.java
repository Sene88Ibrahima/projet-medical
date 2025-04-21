package com.example.demo.orthanc.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;


@Documented
@Constraint(validatedBy = DicomTagValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDicomTag {
    String message() default "Invalid DICOM tag format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}