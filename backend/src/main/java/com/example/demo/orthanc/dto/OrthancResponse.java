package com.example.demo.orthanc.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class OrthancResponse {
    private String status;
    private String message;
    
    @JsonProperty("ID")
    private String id;
}