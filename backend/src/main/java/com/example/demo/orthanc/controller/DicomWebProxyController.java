package com.example.demo.orthanc.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.demo.orthanc.config.OrthancConfig;

@RestController
@RequestMapping("/api/v1/dicomweb")
@RequiredArgsConstructor
public class DicomWebProxyController {

    private final RestTemplate orthancRestTemplate; // Bean defined in OrthancConfig
    private final OrthancConfig orthancConfig;

    @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.HEAD, RequestMethod.OPTIONS})
    public ResponseEntity<byte[]> proxy(HttpServletRequest request, @RequestHeader HttpHeaders incomingHeaders) {
        // Build target URL by stripping prefix
        String forwardPath = request.getRequestURI().replaceFirst("/api/v1/dicomweb", "");
        String query = request.getQueryString();
        String targetUrl = orthancConfig.getOrthancApiUrl() + "/dicom-web" + forwardPath + (query != null ? ("?" + query) : "");

        // Copy relevant headers and add Basic Auth
        HttpHeaders headers = orthancConfig.createBasicAuthHeaders();
        headers.setAccept(incomingHeaders.getAccept());
        headers.set("Accept","*/*");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<byte[]> response = orthancRestTemplate.exchange(
                    targetUrl,
                    HttpMethod.GET,
                    entity,
                    byte[].class);

            // Pass through status and headers (Content-Type, etc.)
            HttpHeaders respHeaders = new HttpHeaders();
            respHeaders.setContentType(response.getHeaders().getContentType());
            respHeaders.setCacheControl(response.getHeaders().getCacheControl());
            respHeaders.setContentLength(response.getBody() != null ? response.getBody().length : 0);
            respHeaders.add("Access-Control-Allow-Origin", "*");
            respHeaders.add("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept");
            respHeaders.add("Access-Control-Allow-Methods", "GET,OPTIONS,HEAD");
            return new ResponseEntity<>(response.getBody(), respHeaders, response.getStatusCode());
        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }
}
