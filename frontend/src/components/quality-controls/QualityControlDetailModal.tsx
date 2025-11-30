// src/components/quality-controls/QualityControlDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, FileText, Download, Calendar, User, MapPin } from 'lucide-react';
import { qualityService } from '@/services/quality.service';
import { QualityControl, QualityAttachment } from '@/types';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface QualityControlDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  qualityControl: QualityControl;
  onUpdate?: () => void;
}

export const QualityControlDetailModal: React.FC<QualityControlDetailModalProps> = ({
  isOpen,
  onClose,
  qualityControl,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<QualityAttachment[]>([]);

  useEffect(() => {
    if (isOpen && qualityControl?.id) {
      fetchAttachments();
    }
  }, [isOpen, qualityControl?.id]);

  const fetchAttachments = async () => {
    try {
      const data = await qualityService.getAttachmentsByQualityControl(qualityControl.id);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await qualityService.approveQualityControl(qualityControl.id);
      toast.success('Quality control approved successfully');
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve quality control');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      await qualityService.rejectQualityControl(qualityControl.id, reason);
      toast.success('Quality control rejected');
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject quality control');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PASSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      QUARANTINED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      CONDITIONAL_ACCEPT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getDispositionBadge = (disposition: string) => {
    const colors: Record<string, string> = {
      ACCEPT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      REJECT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      REWORK: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      SCRAP: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      CONDITIONAL_ACCEPT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      RETURN_TO_SUPPLIER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[disposition] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (!isOpen || !qualityControl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quality Control Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {qualityControl.controlNumber || qualityControl.inspectionNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getStatusBadge(qualityControl.status)}`}>
                    {qualityControl.status}
                  </span>
                </div>
                {qualityControl.disposition && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Disposition</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getDispositionBadge(qualityControl.disposition)}`}>
                      {qualityControl.disposition}
                    </span>
                  </div>
                )}
              </div>

              {/* Approval Actions */}
              {qualityControl.status === 'PASSED' && !qualityControl.approvedAt && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={loading}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </Button>
                </div>
              )}

              {qualityControl.approvedAt && (
                <div className="text-right">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <CheckCircle size={16} />
                    Approved
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    by {qualityControl.approvedBy} on {format(new Date(qualityControl.approvedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard icon={<FileText />} label="Item ID" value={qualityControl.itemId} />
            <InfoCard icon={<Calendar />} label="Inspection Type" value={qualityControl.inspectionType} />
            <InfoCard icon={<User />} label="Inspector ID" value={qualityControl.inspectorId} />
            {qualityControl.lotId && <InfoCard icon={<FileText />} label="Lot ID" value={qualityControl.lotId} />}
            {qualityControl.serialNumber && <InfoCard icon={<FileText />} label="Serial Number" value={qualityControl.serialNumber} />}
            {qualityControl.inspectionLocationId && (
              <InfoCard icon={<MapPin />} label="Location" value={qualityControl.inspectionLocationId} />
            )}
          </div>

          {/* Quantities */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quantities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuantityCard label="Inspected" value={qualityControl.quantityInspected} />
              {qualityControl.passedQuantity !== undefined && (
                <QuantityCard label="Passed" value={qualityControl.passedQuantity} color="green" />
              )}
              {qualityControl.failedQuantity !== undefined && (
                <QuantityCard label="Failed" value={qualityControl.failedQuantity} color="red" />
              )}
              {qualityControl.defectCount !== undefined && (
                <QuantityCard label="Defects" value={qualityControl.defectCount} color="orange" />
              )}
            </div>
            {qualityControl.defectRate !== undefined && (
              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Defect Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(qualityControl.defectRate * 100).toFixed(2)}%</p>
              </div>
            )}
          </div>

          {/* Inspection Results */}
          {qualityControl.inspectionResults && qualityControl.inspectionResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inspection Results</h3>
              <div className="space-y-3">
                {qualityControl.inspectionResults.map((result, index) => (
                  <div key={result.id || index} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{result.testParameter}</h4>
                        {result.defectType && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Defect: {result.defectType}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.defectSeverity && (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            result.defectSeverity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            result.defectSeverity === 'MAJOR' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {result.defectSeverity}
                          </span>
                        )}
                        {result.isPassed ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : (
                          <XCircle className="text-red-600" size={20} />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {result.expectedValue && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Expected:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.expectedValue}</span>
                        </div>
                      )}
                      {result.actualValue && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Actual:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.actualValue}</span>
                        </div>
                      )}
                      {result.minValue !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Min:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.minValue}</span>
                        </div>
                      )}
                      {result.maxValue !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Max:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.maxValue}</span>
                        </div>
                      )}
                    </div>
                    {result.remarks && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">{result.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(qualityControl.inspectorNotes || qualityControl.correctiveAction) && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes & Actions</h3>
              <div className="space-y-4">
                {qualityControl.inspectorNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Inspector Notes
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {qualityControl.inspectorNotes}
                    </p>
                  </div>
                )}
                {qualityControl.correctiveAction && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Corrective Actions
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {qualityControl.correctiveAction}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attachments ({attachments.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="text-gray-400 flex-shrink-0" size={20} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(attachment.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h3>
            <div className="space-y-2 text-sm">
              {qualityControl.scheduledDate && (
                <TimelineItem label="Scheduled" value={format(new Date(qualityControl.scheduledDate), 'MMM dd, yyyy HH:mm')} />
              )}
              {qualityControl.startTime && (
                <TimelineItem label="Started" value={format(new Date(qualityControl.startTime), 'MMM dd, yyyy HH:mm')} />
              )}
              {qualityControl.endTime && (
                <TimelineItem label="Completed" value={format(new Date(qualityControl.endTime), 'MMM dd, yyyy HH:mm')} />
              )}
              <TimelineItem label="Created" value={format(new Date(qualityControl.createdAt), 'MMM dd, yyyy HH:mm')} />
              {qualityControl.updatedAt && qualityControl.updatedAt !== qualityControl.createdAt && (
                <TimelineItem label="Last Updated" value={format(new Date(qualityControl.updatedAt), 'MMM dd, yyyy HH:mm')} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const QuantityCard: React.FC<{ label: string; value: number; color?: 'green' | 'red' | 'orange' }> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${color ? colorClasses[color] : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
};

const TimelineItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-gray-900 dark:text-white font-medium">{value}</span>
  </div>
);
