import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getProfile, updateProfile, uploadFile } from '../../api/profileApi';
import { buildAssetUrl } from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaBuilding, FaUniversity, FaFileAlt, FaLock, FaUpload, FaTrash } from 'react-icons/fa';

// Reusable forms from farmer profile
import BankDetailsForm from '../../components/farmer/profile/BankDetailsForm';
import DocumentsForm from '../../components/farmer/profile/DocumentsForm';
import SecurityForm from '../../components/farmer/profile/SecurityForm';

// Business specific form
import BusinessInfoForm from '../../components/business/profile/BusinessInfoForm';
import ProfileInfoForm from '../../components/farmer/profile/ProfileInfoForm';

const BusinessProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('business');

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm();

  useEffect(() => {
    getProfile()
      .then(data => {
        updateUser(data);
        // Use a timeout to ensure form is mounted before setting values
        setTimeout(() => {
          Object.keys(data).forEach(key => {
            setValue(key, data[key]);
          });
        }, 0);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [updateUser, setValue]);

  const onSubmit = async (data) => {
    try {
      const updatedUserData = await updateProfile(data);
      updateUser(updatedUserData);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        const updatedUserData = await updateProfile({ profilePicture: url });
        updateUser(updatedUserData);
      } catch (err) {
        alert('Failed to upload profile picture.');
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const updatedUserData = await updateProfile({ profilePicture: '' });
      updateUser(updatedUserData);
    } catch (err) {
      alert('Failed to remove profile picture.');
    }
  };

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Business Profile</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center flex-col mb-4">
                <div className="relative">
          <img
            src={user?.profilePicture ? buildAssetUrl(user.profilePicture) : 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
                    <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                        <FaUpload />
                        <input id="profile-picture-upload" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} />
                    </label>
                    {user?.profilePicture && (
                      <button type="button" onClick={handleRemoveProfilePicture} className="absolute bottom-0 left-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700">
                        <FaTrash />
                      </button>
                    )}
                </div>
                <h2 className="text-xl font-bold mt-4">{user?.companyName || user?.fullName}</h2>
                <p className="text-gray-500 capitalize">{user?.role}</p>
            </div>
            <nav className="space-y-2">
              <TabButton icon={<FaBuilding />} label="Business Info" tabName="business" activeTab={activeTab} onClick={setActiveTab} />
              <TabButton icon={<FaUser />} label="Personal Info" tabName="profile" activeTab={activeTab} onClick={setActiveTab} />
              <TabButton icon={<FaUniversity />} label="Bank Details" tabName="bank" activeTab={activeTab} onClick={setActiveTab} />
              <TabButton icon={<FaFileAlt />} label="Documents" tabName="documents" activeTab={activeTab} onClick={setActiveTab} />
              <TabButton icon={<FaLock />} label="Security" tabName="security" activeTab={activeTab} onClick={setActiveTab} />
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              {activeTab === 'business' && <BusinessInfoForm register={register} errors={errors} control={control} />}
              {activeTab === 'profile' && <ProfileInfoForm register={register} errors={errors} />}
              {activeTab === 'bank' && <BankDetailsForm register={register} errors={errors} />}
              {activeTab === 'documents' && <DocumentsForm control={control} register={register} setValue={setValue} watch={watch} />}
              
              {activeTab !== 'security' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button type="submit" className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Changes</button>
                </div>
              )}
            </form>
            {activeTab === 'security' && <SecurityForm />}
          </div>
        </main>
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, tabName, activeTab, onClick }) => (
  <button 
    type="button"
    onClick={() => onClick(tabName)}
    className={`w-full flex items-center p-3 rounded-lg text-left font-semibold transition-colors ${
      activeTab === tabName 
      ? 'bg-blue-100 text-blue-700' 
      : 'text-gray-600 hover:bg-gray-100'
    }`}>
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

export default BusinessProfilePage;
