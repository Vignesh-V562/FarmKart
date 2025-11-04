import React from 'react';

const FarmDetailsForm = ({ register, errors }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Farm Details</h2>
    <div className="space-y-4">
      <InputField label="Farm Name" error={errors.farmName} {...register('farmName')} />
      <h3 className="text-lg font-semibold pt-4">Farm Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Street" error={errors.farmAddress?.street} {...register('farmAddress.street')} />
        <InputField label="City" error={errors.farmAddress?.city} {...register('farmAddress.city')} />
        <InputField label="State" error={errors.farmAddress?.state} {...register('farmAddress.state')} />
        <InputField label="ZIP Code" error={errors.farmAddress?.zip} {...register('farmAddress.zip')} />
        <InputField label="Country" error={errors.farmAddress?.country} {...register('farmAddress.country')} />
      </div>
      <h3 className="text-lg font-semibold pt-4">Farm Geolocation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Latitude" type="number" step="any" error={errors.farmGeolocation?.lat} {...register('farmGeolocation.lat')} />
        <InputField label="Longitude" type="number" step="any" error={errors.farmGeolocation?.lng} {...register('farmGeolocation.lng')} />
      </div>
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

export default FarmDetailsForm;
