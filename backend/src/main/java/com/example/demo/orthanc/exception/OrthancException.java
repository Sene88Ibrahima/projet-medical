package com.example.demo.orthanc.exception;

public class OrthancException extends RuntimeException {
    public OrthancException(String message) {
        super(message);
    }

    public OrthancException(String message, Throwable cause) {
        super(message, cause);
    }
}