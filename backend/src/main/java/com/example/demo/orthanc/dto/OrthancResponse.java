package com.example.demo.orthanc.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class OrthancResponse {
    private String status;
    private String message;
    private String id;
}