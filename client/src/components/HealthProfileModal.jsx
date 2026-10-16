import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  ShieldAlert, 
  Heart, 
  Droplet, 
  Phone, 
  User, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  CreditCard
} from 'lucide-react';

export default function HealthProfileModal({ onClose }) {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();

  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || 'B+');
  const [allergies, setAllergies] = useState(profile?.allergies || ['Penicillin (Severe rash & swelling)', 'Sulfa Drugs']);
  const [conditions, setConditions] = useState(profile?.conditions || ['Type 2 Diabetes Mellitus (2 yrs)', 'Mild Hypertension', 'Bilateral Knee Osteoarthritis']);
  const [contactName, setContactName] = useState(profile?.emergency_contact_name || 'Rohan Sharma (Son)');
  const [contactPhone, setContactPhone] = useState(profile?.emergency_contact_phone || '+91 98201 12345');
  const [contactRelation, setContactRelation] = useState(profile?.emergency_contact_relation || 'Son');
  const [abhaId, setAbhaId] = useState(user?.abha_id || '91-4523-8812-7019');

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setAllergies([...allergies, newAllergy.trim()]);
    setNewAllergy('');
  };

  const handleRemoveAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setConditions([...conditions, newCondition.trim()]);
    setNewCondition('');
  };

  const handleRemoveCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({
        blood_group: bloodGroup,
        allergies,
        conditions,
        emergency_contact_name: contactName,
        emergency_contact_phone: contactPhone,
        emergency_contact_relation: contactRelation,
        abha_id: abhaId
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      alert('Failed to update health profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <Heart className="w-5 h-5 text-teal-200 fill-teal-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('healthProfile.title')}</h2>
              <p className="text-xs text-teal-100">{user?.name} • {t('healthProfile.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800">
          
          {/* Blood Group & ABHA ID Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Blood Group */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Droplet className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>{t('healthProfile.bloodGroup')} *</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 tap-target text-sm"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* ABHA ID */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                <span>ABHA ID</span>
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="91-4523-8812-7019"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 tap-target"
              />
            </div>

          </div>

          {/* CRITICAL ALLERGIES SECTION - PROMINENT WARNING STYLING & ICON (PRD 7.6) */}
          <div className="bg-red-50/90 border-2 border-red-400 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
              <div>
                <h4 className="font-black text-red-950 text-xs uppercase tracking-wider">
                  {t('healthProfile.allergies')}
                </h4>
                <p className="text-[11px] text-red-800 font-semibold mt-0.5">
                  {t('healthProfile.allergyNotice')}
                </p>
              </div>
            </div>

            {/* Allergy Chips with Delete Option */}
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border-2 border-red-500 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-xs font-black text-red-900 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 fill-red-100 flex-shrink-0" />
                  <span>{allergy}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="p-0.5 hover:bg-red-100 rounded-full text-red-600 transition"
                    title="Remove allergy"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {allergies.length === 0 && (
                <span className="text-slate-500 italic">{t('healthProfile.noAllergies')}</span>
              )}
            </div>

            {/* Add Allergy Input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                placeholder={t('healthProfile.addAllergyPlaceholder')}
                className="flex-1 bg-white border border-red-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
              >
                {t('healthProfile.addAllergyBtn')}
              </button>
            </div>
          </div>

          {/* CHRONIC CONDITIONS SECTION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {t('healthProfile.conditions')}
            </h4>

            <div className="space-y-1.5">
              {conditions.map((cond, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>• {cond}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {conditions.length === 0 && (
                <span className="text-slate-500 italic">{t('healthProfile.noConditions')}</span>
              )}
            </div>

            {/* Add Condition Input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                placeholder={t('healthProfile.addConditionPlaceholder')}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                {t('healthProfile.addConditionBtn')}
              </button>
            </div>
          </div>

          {/* PRIMARY EMERGENCY CONTACT SECTION (PRD 7.6) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('healthProfile.emergencyContact')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t('healthProfile.contactName')}</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Rohan Sharma"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t('healthProfile.contactPhone')}</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98201 12345"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t('healthProfile.contactRelation')}</label>
                <input
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="Son / Daughter"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center space-x-2 tap-target text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('healthProfile.saving')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('healthProfile.saveChanges')}</span>
                </>
              )}
            </button>
          </div>

          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold text-center animate-fadeIn">
              ✓ {t('healthProfile.successMsg')}
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
