package com.stock.qualityservice.controller;


import com.stock.qualityservice.dto.request.QualityAttachmentRequest;
import com.stock.qualityservice.dto.response.QualityAttachmentResponse;
import com.stock.qualityservice.service.QualityAttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/quality-attachments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Quality Attachments", description = "Quality Attachment Management APIs")
public class QualityAttachmentController {

    private final QualityAttachmentService attachmentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'ADMIN')")
    @Operation(summary = "Upload attachment", description = "Upload a file attachment for quality control or quarantine")
    public ResponseEntity<QualityAttachmentResponse> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long qualityControlId,
            @RequestParam(required = false) Long quarantineId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String attachmentType) {
        log.info("Uploading attachment: {}", file.getOriginalFilename());

        QualityAttachmentRequest request = new QualityAttachmentRequest();
        request.setQualityControlId(String.valueOf(qualityControlId));
        request.setQuarantineId(String.valueOf(quarantineId));
        request.setDescription(description);
        request.setAttachmentType(attachmentType);

        QualityAttachmentResponse response = attachmentService.uploadAttachment(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get attachment by ID")
    public ResponseEntity<QualityAttachmentResponse> getAttachmentById(@PathVariable Long id) {
        log.info("Fetching attachment with ID: {}", id);
        QualityAttachmentResponse response = attachmentService.getAttachmentById(String.valueOf(id));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/quality-control/{qualityControlId}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get attachments by quality control ID")
    public ResponseEntity<List<QualityAttachmentResponse>> getAttachmentsByQualityControlId(
            @PathVariable Long qualityControlId) {
        log.info("Fetching attachments for quality control: {}", qualityControlId);
        List<QualityAttachmentResponse> response = attachmentService.getAttachmentsByQualityControlId(String.valueOf(qualityControlId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/quarantine/{quarantineId}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get attachments by quarantine ID")
    public ResponseEntity<List<QualityAttachmentResponse>> getAttachmentsByQuarantineId(
            @PathVariable Long quarantineId) {
        log.info("Fetching attachments for quarantine: {}", quarantineId);
        List<QualityAttachmentResponse> response = attachmentService.getAttachmentsByQuarantineId(String.valueOf(quarantineId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{attachmentType}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'QUALITY_INSPECTOR', 'WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get attachments by type")
    public ResponseEntity<List<QualityAttachmentResponse>> getAttachmentsByType(
            @PathVariable String attachmentType) {
        log.info("Fetching attachments of type: {}", attachmentType);
        List<QualityAttachmentResponse> response = attachmentService.getAttachmentsByType(attachmentType);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUALITY_MANAGER', 'ADMIN')")
    @Operation(summary = "Delete attachment")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        log.info("Deleting attachment with ID: {}", id);
        attachmentService.deleteAttachment(String.valueOf(id));
        return ResponseEntity.noContent().build();
    }
}



