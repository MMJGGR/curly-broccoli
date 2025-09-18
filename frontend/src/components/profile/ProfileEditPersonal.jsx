import React, { useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ProfileEditPersonal = () => {
  const { profile, updateProfile } = useUnifiedFinancialContext();
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    date_of_birth: profile?.date_of_birth || '',
    phone: profile?.phone || '',
    nationalId: profile?.national_id || profile?.nationalId || '',
    kra_pin: profile?.kra_pin || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Validate date of birth is not in the future
      if (form.date_of_birth) {
        const dob = new Date(form.date_of_birth);
        const now = new Date();
        if (dob > now) {
          setMessage('Date of birth cannot be in the future');
          setSaving(false);
          return;
        }
      }
      await updateProfile(form);
      setMessage('Personal details saved');
    } catch (e) {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">First Name</label>
          <input name="first_name" value={form.first_name} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Last Name</label>
          <input name="last_name" value={form.last_name} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
          <input type="date" name="date_of_birth" value={form.date_of_birth || ''} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">National ID</label>
          <input name="nationalId" value={form.nationalId} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">KRA PIN</label>
          <input name="kra_pin" value={form.kra_pin} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving ? 'Saving...' : 'Save'}</button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
};

export default ProfileEditPersonal;
