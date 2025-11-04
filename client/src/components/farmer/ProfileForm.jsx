import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { updateProfile } from '../../api/profileApi';

const ProfileForm = ({ user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    farmName: user?.farmName || '',
    farmAddress: user?.farmAddress || '',
    geoLocation: user?.geoLocation || '',
    businessName: user?.businessName || '',
    bankAccountName: user?.bankAccountName || '',
    bankAccountNumber: user?.bankAccountNumber || '',
    bankName: user?.bankName || '',
    bankBranch: user?.bankBranch || '',
    ifscCode: user?.ifscCode || '',
    gstNumber: user?.gstNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateProfile(formData);
      setSuccess(true);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input id="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} />
        <Input id="email" label="Email" value={formData.email} onChange={handleChange} disabled />
        <Input id="mobile" label="Mobile" value={formData.mobile} onChange={handleChange} />
        <Input id="farmName" label="Farm Name" value={formData.farmName} onChange={handleChange} />
        <Input id="farmAddress" label="Farm Address" value={formData.farmAddress} onChange={handleChange} />
        <Input id="geoLocation" label="Geo Location" value={formData.geoLocation} onChange={handleChange} />
        <Input id="businessName" label="Business Name" value={formData.businessName} onChange={handleChange} />
        <Input id="gstNumber" label="GST/VAT Number" value={formData.gstNumber} onChange={handleChange} />
      </div>
      <h2 className="text-xl font-bold mt-6 mb-4">Bank Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input id="bankAccountName" label="Account Holder Name" value={formData.bankAccountName} onChange={handleChange} />
        <Input id="bankAccountNumber" label="Account Number" value={formData.bankAccountNumber} onChange={handleChange} />
        <Input id="bankName" label="Bank Name" value={formData.bankName} onChange={handleChange} />
        <Input id="bankBranch" label="Branch" value={formData.bankBranch} onChange={handleChange} />
        <Input id="ifscCode" label="IFSC Code" value={formData.ifscCode} onChange={handleChange} />
      </div>
      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        {success && <p className="text-green-500 mt-2">Profile updated successfully!</p>}
      </div>
    </form>
  );
};

export default ProfileForm;
