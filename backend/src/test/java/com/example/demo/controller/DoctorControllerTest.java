package com.example.demo.controller;

import com.example.demo.dto.UserDTO;
import com.example.demo.model.Role;
import com.example.demo.orthanc.dto.DicomStudyDTO;
import com.example.demo.orthanc.service.OrthancService;
import com.example.demo.service.DoctorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class DoctorControllerTest {

    @Mock
    private DoctorService doctorService;
    
    @Mock
    private OrthancService orthancService;

    @InjectMocks
    private DoctorController doctorController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(doctorController).build();
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testGetAllPatients() throws Exception {
        // Arrange
        List<UserDTO> patients = Arrays.asList(
                UserDTO.builder().id(1L).firstName("Jean").lastName("Dupont").email("jean.dupont@example.com").role(Role.PATIENT).build(),
                UserDTO.builder().id(2L).firstName("Marie").lastName("Martin").email("marie.martin@example.com").role(Role.PATIENT).build()
        );
        
        when(doctorService.getAllPatients()).thenReturn(patients);

        // Act & Assert
        mockMvc.perform(get("/api/v1/doctor/patients")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Jean"))
                .andExpect(jsonPath("$[1].firstName").value("Marie"));
    }
    
    @Test
    @WithMockUser(roles = "DOCTOR")
    void testGetDicomStudies() throws Exception {
        // Arrange
        List<DicomStudyDTO> studies = Arrays.asList(
                new DicomStudyDTO(),
                new DicomStudyDTO()
        );
        studies.get(0).setId("study-1");
        studies.get(0).setPatientName("Jean Dupont");
        studies.get(1).setId("study-2");
        studies.get(1).setPatientName("Marie Martin");
        
        when(orthancService.getAllStudies(any())).thenReturn(studies);

        // Act & Assert
        mockMvc.perform(get("/api/v1/doctor/dicom/studies")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("study-1"))
                .andExpect(jsonPath("$[0].patientName").value("Jean Dupont"))
                .andExpect(jsonPath("$[1].id").value("study-2"))
                .andExpect(jsonPath("$[1].patientName").value("Marie Martin"));
    }
} 