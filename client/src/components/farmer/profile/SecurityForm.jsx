import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { changePassword } from '../../../api/profileApi';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Please confirm your new password'),
});

const SecurityForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(passwordSchema)
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const message = await changePassword(data);
      alert(message.message);
      reset();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Security</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Current Password" type="password" error={errors.currentPassword} {...register('currentPassword')} />
        <InputField label="New Password" type="password" error={errors.newPassword} {...register('newPassword')} />
        <InputField label="Confirm New Password" type="password" error={errors.confirmNewPassword} {...register('confirmNewPassword')} />
        <div>
          <button type="submit" disabled={loading} className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

const InputField = React.forwardRef(({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input ref={ref} {...props} className={`w-full px-4 py-2 bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`} />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
));

export default SecurityForm;
