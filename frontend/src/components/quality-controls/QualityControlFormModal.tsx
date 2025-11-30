// src/components/quality-controls/QualityControlFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { qualityService } from '@/services/quality.service';
import { QualityControl, InspectionResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';

interface QualityControlFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  qualityControl?: QualityControl | null;
}

export const QualityControlFormModal: React.FC<QualityControlFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  qualityControl
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<QualityControl>>({
    itemId: '',
    lotId: '',
    serialNumber: '',
    quantityInspected: 0,
    inspectionType: 'INCOMING',
    status: 'PENDING',
    inspectorId: '',
    inspectionLocationId: '',
    scheduledDate: '',
    defectCount: 0,
    inspectorNotes: '',
    correctiveAction: '',
    inspectionResults: []
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);

  useEffect(() => {
    if (qualityControl) {
      setFormData({
        ...qualityControl,
        scheduledDate: qualityControl.scheduledDate?.split('T')[0] || ''
      });
      setInspectionResults(qualityControl.inspectionResults || []);
    } else {
      resetForm();
    }
  }, [qualityControl, isOpen]);

  const resetForm = () => {
    setFormData({
      itemId: '',
      lotId: '',
      serialNumber: '',
      quantityInspected: 0,
      inspectionType: 'INCOMING',
      status: 'PENDING',
      inspectorId: '',
      inspectionLocationId: '',
      scheduledDate: '',
      defectCount: 0,
      inspectorNotes: '',
      correctiveAction: '',
      inspectionResults: []
    });
    setInspectionResults([]);
    setAttachments([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const addInspectionResult = () => {
    setInspectionResults(prev => [
      ...prev,
      {
        testParameter: '',
        expectedValue: '',
        actualValue: '',
        unitOfMeasure: '',
        minValue: 0,
        maxValue: 0,
        isPassed: false,
        defectType: '',
        defectSeverity: 'MINOR',
        remarks: '',
        sequenceOrder: prev.length + 1
      }
    ]);
  };

  const updateInspectionResult = (index: number, field: string, value: any) => {
    setInspectionResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeInspectionResult = (index: number) => {
    setInspectionResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        inspectionResults: inspectionResults
      };

      let response;
      if (qualityControl) {
        response = await qualityService.updateQualityControl(qualityControl.id, submitData);
      } else {
        response = await qualityService.createQualityControl(submitData);
      }

      // Upload attachments if any
      if (attachments.length > 0 && response && typeof response === 'object' && 'id' in response) {
        for (const file of attachments) {
          await qualityService.uploadAttachment(
            file,
            response.id,
            undefined,
            `Inspection attachment for ${response.id}`,
            'DOCUMENT'
          );
        }
      }

      toast.success(qualityControl ? 'Quality control updated successfully' : 'Quality control created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save quality control');
      console.error('Quality control save error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {qualityControl ? 'Edit Quality Control' : 'Create Quality Control'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item ID <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="itemId"
                  value={formData.itemId}
                  onChange={handleChange}
                  required
                  placeholder="Enter item ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lot ID
                </label>
                <Input
                  type="text"
                  name="lotId"
                  value={formData.lotId || ''}
                  onChange={handleChange}
                  placeholder="Enter lot ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Serial Number
                </label>
                <Input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber || ''}
                  onChange={handleChange}
                  placeholder="Enter serial number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity Inspected <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="quantityInspected"
                  value={formData.quantityInspected}
                  onChange={handleNumberChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inspection Type <span className="text-red-500">*</span>
                </label>
                <Select
                  name="inspectionType"
                  value={formData.inspectionType}
                  onChange={handleChange}
                  required
                >
                  <option value="INCOMING">Incoming Inspection</option>
                  <option value="IN_PROCESS">In-Process Inspection</option>
                  <option value="FINAL_INSPECTION">Final Inspection</option>
                  <option value="RANDOM_AUDIT">Random Audit</option>
                  <option value="CUSTOMER_RETURN">Customer Return</option>
                  <option value="PROCESS_INSPECTION">Process Inspection</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PASSED">Passed</option>
                  <option value="FAILED">Failed</option>
                  <option value="QUARANTINED">Quarantined</option>
                  <option value="CONDITIONAL_ACCEPT">Conditional Accept</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inspector ID <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="inspectorId"
                  value={formData.inspectorId}
                  onChange={handleChange}
                  required
                  placeholder="Enter inspector ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inspection Location
                </label>
                <Input
                  type="text"
                  name="inspectionLocationId"
                  value={formData.inspectionLocationId || ''}
                  onChange={handleChange}
                  placeholder="Enter location ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Date
                </label>
                <Input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Defect Count
                </label>
                <Input
                  type="number"
                  name="defectCount"
                  value={formData.defectCount || 0}
                  onChange={handleNumberChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Inspection Results */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inspection Results</h3>
              <Button type="button" onClick={addInspectionResult} className="flex items-center gap-2">
                <Plus size={16} />
                Add Test
              </Button>
            </div>

            {inspectionResults.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No inspection results added yet. Click "Add Test" to add test parameters.
              </p>
            ) : (
              <div className="space-y-4">
                {inspectionResults.map((result, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Test #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeInspectionResult(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Test Parameter</label>
                        <Input
                          type="text"
                          value={result.testParameter}
                          onChange={(e) => updateInspectionResult(index, 'testParameter', e.target.value)}
                          placeholder="e.g., Weight, Length"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Expected Value</label>
                        <Input
                          type="text"
                          value={result.expectedValue || ''}
                          onChange={(e) => updateInspectionResult(index, 'expectedValue', e.target.value)}
                          placeholder="Expected value"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Actual Value</label>
                        <Input
                          type="text"
                          value={result.actualValue || ''}
                          onChange={(e) => updateInspectionResult(index, 'actualValue', e.target.value)}
                          placeholder="Actual value"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Unit of Measure</label>
                        <Input
                          type="text"
                          value={result.unitOfMeasure || ''}
                          onChange={(e) => updateInspectionResult(index, 'unitOfMeasure', e.target.value)}
                          placeholder="kg, cm, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Min Value</label>
                        <Input
                          type="number"
                          value={result.minValue || ''}
                          onChange={(e) => updateInspectionResult(index, 'minValue', parseFloat(e.target.value))}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Max Value</label>
                        <Input
                          type="number"
                          value={result.maxValue || ''}
                          onChange={(e) => updateInspectionResult(index, 'maxValue', parseFloat(e.target.value))}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Result</label>
                        <Select
                          value={result.isPassed ? 'true' : 'false'}
                          onChange={(e) => updateInspectionResult(index, 'isPassed', e.target.value === 'true')}
                        >
                          <option value="true">Passed</option>
                          <option value="false">Failed</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Defect Severity</label>
                        <Select
                          value={result.defectSeverity || 'MINOR'}
                          onChange={(e) => updateInspectionResult(index, 'defectSeverity', e.target.value)}
                        >
                          <option value="CRITICAL">Critical</option>
                          <option value="MAJOR">Major</option>
                          <option value="MINOR">Minor</option>
                        </Select>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                        <Input
                          type="text"
                          value={result.remarks || ''}
                          onChange={(e) => updateInspectionResult(index, 'remarks', e.target.value)}
                          placeholder="Additional notes"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Actions */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes & Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inspector Notes
                </label>
                <textarea
                  name="inspectorNotes"
                  value={formData.inspectorNotes || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter inspection notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Corrective Actions
                </label>
                <textarea
                  name="correctiveAction"
                  value={formData.correctiveAction || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter corrective actions..."
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          {!qualityControl && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attachments</h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Upload files</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  or drag and drop
                </p>
                {attachments.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected files ({attachments.length}):
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {attachments.map((file, index) => (
                        <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : qualityControl ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
