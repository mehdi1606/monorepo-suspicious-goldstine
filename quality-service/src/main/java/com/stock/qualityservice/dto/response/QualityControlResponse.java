package com.stock.qualityservice.dto.response;

import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.QCType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityControlResponse {

    private String id;
    private String inspectionNumber;
    private String controlNumber;  // Alias for inspectionNumber (frontend compatibility)
    private String itemId;
    private String lotId;
    private String serialNumber;
    private Double quantityInspected;
    private QCType inspectionType;
    private QCStatus status;
    private String qualityProfileId;
    private String samplingPlanId;
    private String inspectorId;
    private String inspectionLocationId;
    private LocalDateTime scheduledDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Disposition disposition;
    private Double passedQuantity;
    private Double failedQuantity;
    private Integer defectCount;
    private Double defectRate;
    private String inspectorNotes;
    private String correctiveAction;
    private String quarantineId;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private List<InspectionResultResponse> inspectionResults;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}