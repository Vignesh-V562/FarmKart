import React from 'react';
import Input from '../../common/Input';
import { useFieldArray } from 'react-hook-form';

const BusinessInfoForm = ({ register, errors, control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'produceRequired'
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Business Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Company Name"
          name="companyName"
          register={register}
          rules={{ required: 'Company name is required' }}
          error={errors.companyName}
        />
        <Input
          label="Business Type"
          name="businessType"
          register={register}
          placeholder="e.g., Wholesaler, Retailer, Exporter"
        />
        <Input
          label="Company Address"
          name="companyAddress"
          register={register}
          rules={{ required: 'Company address is required' }}
          error={errors.companyAddress}
          className="md:col-span-2"
        />
        <Input
          label="GSTIN"
          name="gstin"
          register={register}
          rules={{ 
            pattern: { 
              value: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
              message: 'Invalid GSTIN format'
            }
          }}
          error={errors.gstin}
        />
        <Input
          label="CIN"
          name="cin"
          register={register}
        />
      </div>

      <h3 className="text-xl font-bold text-gray-700 border-b pb-3 mt-8">Contact Person</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Contact Name"
          name="contactPersonName"
          register={register}
        />
        <Input
          label="Contact Designation"
          name="contactPersonDesignation"
          register={register}
        />
      </div>

      <h3 className="text-xl font-bold text-gray-700 border-b pb-3 mt-8">Produce Requirements</h3>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4">
            <Input
              name={`produceRequired[${index}]`}
              register={register}
              placeholder="e.g., Organic Tomatoes"
              className="flex-grow"
            />
            <button type="button" onClick={() => remove(index)} className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append('')} className="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Add Produce Requirement
        </button>
      </div>
    </div>
  );
};

export default BusinessInfoForm;
