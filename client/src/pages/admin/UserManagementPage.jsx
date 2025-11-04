import React, { useState, useEffect } from 'react';
import { getAllUsers, verifyUser, updateUser, deleteUser } from '../../api/adminApi';
import EditUserModal from '../../components/admin/EditUserModal'; // Import the modal

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleVerify = async (id) => {
    try {
      await verifyUser(id);
      setUsers(users.map(user => user._id === id ? { ...user, isVerified: true } : user));
    } catch (err) {
      console.error('Failed to verify user', err);
    }
  };

  const handleSuspend = async (id, isSuspended) => {
    try {
      await updateUser(id, { isSuspended: !isSuspended });
      setUsers(users.map(user => user._id === id ? { ...user, isSuspended: !isSuspended } : user));
    } catch (err) {
      console.error('Failed to suspend user', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        console.error('Failed to delete user', err);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (id, userData) => {
    try {
      const updatedUserData = await updateUser(id, userData);
      setUsers(users.map(user => (user._id === id ? { ...user, ...updatedUserData } : user)));
      handleCloseModal();
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-center">Role</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map(user => (
              <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{user.fullName}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-center">{user.role}</td>
                <td className="py-3 px-6 text-center">
                  {user.isSuspended ? (
                    <span className="bg-red-200 text-red-600 py-1 px-3 rounded-full text-xs">Suspended</span>
                  ) : user.isVerified ? (
                    <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">Verified</span>
                  ) : (
                    <span className="bg-yellow-200 text-yellow-600 py-1 px-3 rounded-full text-xs">Pending</span>
                  )}
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    {user.role === 'farmer' && !user.isVerified && (
                      <button onClick={() => handleVerify(user._id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">
                        Verify
                      </button>
                    )}
                    <button onClick={() => handleEdit(user)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">
                      Edit
                    </button>
                    <button onClick={() => handleSuspend(user._id, user.isSuspended)} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">
                      {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isEditModalOpen && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserManagementPage;