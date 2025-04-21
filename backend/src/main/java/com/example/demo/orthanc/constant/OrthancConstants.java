package com.example.demo.orthanc.constant;

public class OrthancConstants {
    public static final String API_VERSION = "v1";
    public static final String API_BASE_PATH = "/api/" + API_VERSION + "/dicom";
    
    public static final String AUDIT_ACTION_UPLOAD = "UPLOAD";
    public static final String AUDIT_ACTION_DOWNLOAD = "DOWNLOAD";
    public static final String AUDIT_ACTION_DELETE = "DELETE";
    public static final String AUDIT_ACTION_MODIFY = "MODIFY";
    
    private OrthancConstants() {
        // Empêcher l'instanciation
    }
}