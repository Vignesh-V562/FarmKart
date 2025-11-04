import React from 'react';

const BankDetailsForm = ({ register, errors }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Bank & Payout Details</h2>
    <div className="space-y-4">
      <InputField label="Account Holder Name" error={errors.bankDetails?.accountName} {...register('bankDetails.accountName')} />
      <InputField label="Account Number" error={errors.bankDetails?.accountNumber} {...register('bankDetails.accountNumber')} />
      <InputField label="Bank Name" error={errors.bankDetails?.bankName} {...register('bankDetails.bankName')} />
      <InputField label="Branch" error={errors.bankDetails?.branch} {...register('bankDetails.branch')} />
      <InputField label="IFSC Code" error={errors.bankDetails?.ifscCode} {...register('bankDetails.ifscCode')} />
    </div>
  </div>
);

const InputField = React.forwardRef(({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input ref={ref} {...props} className={`w-full px-4 py-2 bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`} />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
));

export default BankDetailsForm;
