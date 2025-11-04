import React, { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { uploadFile } from '../../../api/profileApi';
import { FaUpload, FaTrash, FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaHourglassHalf } from 'react-icons/fa';

const DocumentsForm = ({ control, register, setValue, watch }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents'
  });

  const [newDocName, setNewDocName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAddDocument = async (e) => {
    const file = e.target.files[0];
    if (!file || !newDocName) {
      alert('Please provide a document name and select a file.');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadFile(file);
      append({ 
        name: newDocName, 
        url: url, 
        verificationStatus: 'pending' 
      });
      setNewDocName(''); // Reset name field
    } catch (err) {
      alert('Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" title="Approved" />;
      case 'rejected':
        return <FaExclamationTriangle className="text-red-500" title="Rejected" />;
      default:
        return <FaHourglassHalf className="text-yellow-500" title="Pending" />;
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Documents</h2>
      
      {/* Add new document form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="font-semibold mb-2">Add New Document</h3>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Document Name (e.g., Organic Certificate)" 
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            className="flex-grow px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <label className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2">
            <FaUpload />
            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            <input type="file" className="hidden" onChange={handleAddDocument} disabled={uploading || !newDocName} />
          </label>
        </div>
      </div>

      {/* Existing documents list */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              {getStatusIcon(field.verificationStatus)}
              <FaFileAlt className="text-gray-400" />
              <a href={field.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                {field.name}
              </a>
            </div>
            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
              <FaTrash />
            </button>
          </div>
        ))}
        {fields.length === 0 && (
            <p className="text-gray-500 text-center py-4">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentsForm;
