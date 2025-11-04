import React from 'react';

const ProfileInfoForm = ({ register, errors }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
    <div className="space-y-4">
      <InputField label="Full Name" error={errors.fullName} {...register('fullName')} />
      <InputField label="Email Address" {...register('email')} readOnly disabled />
      <InputField label="Mobile Number" error={errors.mobile} {...register('mobile')} />
      <TextareaField label="Bio / About Me" error={errors.bio} {...register('bio')} placeholder="Tell us a little about yourself and your farm..." />
    </div>
  </div>
);

const InputField = React.forwardRef(({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input ref={ref} {...props} className={`w-full px-4 py-2 bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-200`} />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
));

const TextareaField = React.forwardRef(({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea ref={ref} {...props} rows={4} className={`w-full px-4 py-2 bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`} />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
));

export default ProfileInfoForm;
