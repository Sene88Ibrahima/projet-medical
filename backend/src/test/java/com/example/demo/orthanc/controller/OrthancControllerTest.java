package com.example.demo.orthanc.controller;

import com.example.demo.orthanc.dto.OrthancResponse;
import com.example.demo.orthanc.service.OrthancService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class OrthancControllerTest {

    @Mock
    private OrthancService orthancService;

    @InjectMocks
    private OrthancController orthancController;

    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "DOCTOR")
    void uploadDicomFile_Success() throws Exception {
        // Setup MockMVC
        mockMvc = MockMvcBuilders.standaloneSetup(orthancController).build();
        
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.dcm", "application/dicom", "test data".getBytes()
        );

        OrthancResponse mockResponse = new OrthancResponse();
        mockResponse.setId("test-id");
        mockResponse.setStatus("success");
        when(orthancService.uploadDicomFile(any())).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/dicom/upload")
                .file(file)
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }
}