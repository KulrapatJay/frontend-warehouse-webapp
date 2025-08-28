import React, { useState, useEffect } from 'react';
import { User as userMock } from '@/mock/user';
import { Role } from '@/mock/roles';
import { Prefix } from '@/mock/prefixs';

type User = (typeof userMock)[number]; 

type EditUserModalProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
};

export default function EditUserForm({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'role_id' || name === 'prefix_id' ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <dialog id="edit_user_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit User</h3>
        <p className="py-2 text-sm opacity-70">Update user details for {user?.first_name} {user?.last_name}.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            
            {/* Prefix */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Prefix</span>
              </div>
              <select
                name="prefix_id"
                className="select select-bordered"
                value={formData.prefix_id}
                onChange={handleChange}
              >
                {Prefix.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>

            {/* Role */}
             <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Role</span>
              </div>
              <select
                name="role_id"
                className="select select-bordered"
                value={formData.role_id}
                onChange={handleChange}
              >
                {Role.map(r => (
                  <option key={r.id} value={r.id}>{r.role_name}</option>
                ))}
              </select>
            </label>

            {/* First Name */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">First Name</span>
              </div>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                className="input input-bordered w-full"
                value={formData.first_name}
                onChange={handleChange}
              />
            </label>

            {/* Last Name */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Last Name</span>
              </div>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                className="input input-bordered w-full"
                value={formData.last_name}
                onChange={handleChange}
              />
            </label>

             {/* Username */}
             <label className="form-control w-full md:col-span-2">
              <div className="label">
                <span className="label-text">Username</span>
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input input-bordered w-full"
                value={formData.username}
                onChange={handleChange}
              />
            </label>
          </div>

          {/* Modal Actions */}
          <div className="modal-action mt-6">
             <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success text-white">Save Changes</button>
          </div>
        </form>
      </div>
       {/* Optional: close modal on outside click */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}