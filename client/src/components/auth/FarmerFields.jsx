import React from 'react';
import Input from '../common/Input';

const FarmerFields = ({ onChange }) => {
  return (
    <div className="mt-6 space-y-6" onChange={onChange}>
      {/* Farm Details Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-300 mb-4 border-b border-gray-500 pb-2">
          Farm Details
        </h3>
        <Input id="farmName" label="Farm Name" placeholder="Green Valley Farms" required />
        <Input id="farmAddress.street" label="Street Address" placeholder="6/17 Kovil Street" required />
        <Input id="farmAddress.city" label="City" placeholder="Villupuram" required />
        <Input id="farmAddress.state" label="State" placeholder="Tamil Nadu" required />
        <Input id="farmAddress.zip" label="ZIP / Postal Code" placeholder="605103" required />
        <Input id="farmAddress.country" label="Country" placeholder="India" required />
        <Input id="farmGeolocation" label="Farm Geolocation (Optional)" placeholder="e.g., 12.8238, 80.2230" />
        <Input id="cropsGrown" label="Types of Crops Grown" placeholder="Tomatoes, Wheat, Mangoes" required />
      </div>

      {/* Licenses & Certifications Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-300 mb-4 border-b border-gray-500 pb-2">
          Licenses & Certifications (Optional)
        </h3>
        <Input id="fssaiLicense" label="FSSAI License Number" />
        <Input id="organicCertNum" label="Organic Certification Number" />
        <Input id="certAuthority" label="Certification Authority" />
        {/* Future FileUpload component could be added here */}
      </div>
    </div>
  );
};

export default FarmerFields;
