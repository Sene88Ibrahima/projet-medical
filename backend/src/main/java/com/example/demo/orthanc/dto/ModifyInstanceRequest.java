package com.example.demo.orthanc.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ModifyInstanceRequest {
    private Map<String, String> replaceTags;
    private Map<String, String> removeTags;
    private boolean keepPrivateTags;
}