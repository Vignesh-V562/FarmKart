import React from 'react';
import Input from '../common/Input';

const BusinessFields = ({ onChange }) => {
  return (
    <div className="mt-6 space-y-6" onChange={onChange}>
      <div>
        <h3 className="text-base font-semibold text-gray-300 mb-4 border-b border-gray-500 pb-2">
          Company Details
        </h3>
        <Input id="companyName" label="Company Name" placeholder="Fresh Produce Inc." required />
        <Input id="businessType" label="Business Type" placeholder="e.g., Restaurant, Retailer, Wholesaler" required />
        <Input id="companyAddress" label="Company Address" placeholder="456 Business Ave, City" required />
        <Input id="gstin" label="GSTIN" placeholder="22AAAAA0000A1Z5" required />
        <Input id="cin" label="Business Registration Number / CIN" />
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-300 mb-4 border-b border-gray-500 pb-2">
          Primary Contact
        </h3>
        <Input id="contactPersonName" label="Primary Contact Person Name" placeholder="Jane Smith" required />
        <Input id="contactPersonDesignation" label="Designation" placeholder="Procurement Manager" required />
        <Input id="produceRequired" label="Types of Produce Required" placeholder="Organic Vegetables, Exotic Fruits" required />
      </div>
    </div>
  );
};

export default BusinessFields;
