import React, { useState } from 'react';
import { uploadDocument } from '../../api/profileApi';

const DocumentUploads = () => {
  const [organicCertificate, setOrganicCertificate] = useState(null);
  const [fssaiLicense, setFssaiLicense] = useState(null);
  const [otherLicense, setOtherLicense] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [uploading, setUploading] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(type);
    setSuccess('');
    try {
      const response = await uploadDocument(file, type);
      switch (type) {
        case 'organicCertificate':
          setOrganicCertificate(response.filePath);
          break;
        case 'fssaiLicense':
          setFssaiLicense(response.filePath);
          break;
        case 'otherLicense':
          setOtherLicense(response.filePath);
          break;
        case 'idDocument':
          setIdDocument(response.filePath);
          break;
        default:
          break;
      }
      setSuccess(type);
    } catch (error) {
      console.error(`Failed to upload ${type}`, error);
    } finally {
      setUploading('');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mt-6 mb-4">Documents and Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Organic Certificate</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'organicCertificate')} className="mt-1 block w-full" />
          {uploading === 'organicCertificate' && <p>Uploading...</p>}
          {success === 'organicCertificate' && <p className="text-green-500">Uploaded!</p>}
          {organicCertificate && <a href={`${organicCertificate}`} target="_blank" rel="noopener noreferrer">View</a>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">FSSAI License</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'fssaiLicense')} className="mt-1 block w-full" />
          {uploading === 'fssaiLicense' && <p>Uploading...</p>}
          {success === 'fssaiLicense' && <p className="text-green-500">Uploaded!</p>}
          {fssaiLicense && <a href={`${fssaiLicense}`} target="_blank" rel="noopener noreferrer">View</a>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Other Licenses</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'otherLicense')} className="mt-1 block w-full" />
          {uploading === 'otherLicense' && <p>Uploading...</p>}
          {success === 'otherLicense' && <p className="text-green-500">Uploaded!</p>}
          {otherLicense && <a href={`${otherLicense}`} target="_blank" rel="noopener noreferrer">View</a>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Document</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'idDocument')} className="mt-1 block w-full" />
          {uploading === 'idDocument' && <p>Uploading...</p>}
          {success === 'idDocument' && <p className="text-green-500">Uploaded!</p>}
          {idDocument && <a href={`${idDocument}`} target="_blank" rel="noopener noreferrer">View</a>}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploads;
