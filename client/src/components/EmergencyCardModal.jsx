import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  AlertCircle, 
  Printer, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Phone, 
  Droplet, 
  Pill, 
  Activity,
  Sliders,
  Power,
  CheckSquare,
  Square,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function EmergencyCardModal({ onClose }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [emergencyCard, setEmergencyCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Configurable fields state (PRD Section 7.10)
  const [visibleFields, setVisibleFields] = useState([
    'name',
    'age',
    'blood_group',
    'allergies',
    'conditions',
    'medicines',
    'emergency_contact'
  ]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('card'); // 'card' or 'customize'

  useEffect(() => {
    async function fetchEmergency() {
      try {
        const res = await api.getMyEmergencyCard();
        setEmergencyCard(res);
        if (Array.isArray(res.visible_fields) && res.visible_fields.length > 0) {
          setVisibleFields(res.visible_fields);
        }
        setIsEnabled(res.is_enabled === 1 || res.is_enabled === true);
      } catch (err) {
        console.error('Failed to get emergency card:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmergency();
  }, []);

  const toggleField = (field) => {
    if (visibleFields.includes(field)) {
      setVisibleFields(visibleFields.filter(f => f !== field));
    } else {
      setVisibleFields([...visibleFields, field]);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.updateEmergencyCard({
        isEnabled,
        visibleFields
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Failed to update emergency card settings');
    } finally {
      setSaving(false);
    }
  };

  const token = emergencyCard?.token || 'emergency-sunita-sharma';
  const publicUrl = `${window.location.origin}/emergency/${token}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const allergies = profile?.allergies || ['Penicillin', 'Sulfa drugs'];
  const conditions = profile?.conditions || ['Type 2 Diabetes Mellitus', 'Mild Hypertension'];

  const availableFieldOptions = [
    { id: 'name', label: t('emergency.fieldPatientName') },
    { id: 'age', label: t('emergency.fieldAge') },
    { id: 'blood_group', label: t('emergency.fieldBloodGroup') },
    { id: 'allergies', label: t('emergency.fieldAllergies') },
    { id: 'conditions', label: t('emergency.fieldConditions') },
    { id: 'medicines', label: t('emergency.fieldMedicines') },
    { id: 'emergency_contact', label: t('emergency.fieldContact') }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Urgent Red Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 flex items-center justify-between border-b border-red-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl border border-white/20">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black">{t('emergency.title')}</h2>
              </div>
              <p className="text-xs text-red-100">{t('emergency.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: View Card vs Configure Fields */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('card')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'card'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('emergency.cardTab')}
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'customize'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('emergency.configureTab', { count: visibleFields.length })}</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span className="text-[11px] text-slate-600">
              {isEnabled ? t('emergency.statusActive') : t('emergency.statusDisabled')}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          
          {activeTab === 'customize' ? (
            /* ============================================================ */
            /* PATIENT FIELD SELECTION & DISABLE TOGGLE (PRD 7.10)          */
            /* ============================================================ */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Enable / Disable Emergency Card Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    <Power className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900 block">{t('emergency.title')}</span>
                    <span className="text-xs text-slate-500">
                      {isEnabled ? t('emergency.toggleEnable') : t('emergency.toggleDisable')}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Patient Chooses Which Fields Appear (PRD 7.10) */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  {t('emergency.configureTab', { count: visibleFields.length })}:
                </label>
                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white">
                  {availableFieldOptions.map((opt) => {
                    const isChecked = visibleFields.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleField(opt.id)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer hover:bg-red-50/40 transition text-xs ${
                          isChecked ? 'bg-red-50/20 font-bold' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="text-red-600">
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                          </div>
                          <span>{opt.label}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isChecked ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isChecked ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Configuration Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-md shadow-red-600/20 transition flex items-center justify-center space-x-2 tap-target disabled:opacity-50 text-sm cursor-pointer"
                >
                  {saving ? '...' : t('emergency.savePreferences')}
                </button>
                {saveSuccess && (
                  <p className="text-xs font-bold text-emerald-700 text-center animate-fadeIn">
                    ✓ {t('emergency.savedSuccess')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* PHYSICAL CARD & QR VIEW (PRD 7.10)                           */
            /* ============================================================ */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Status Warning if Disabled */}
              {!isEnabled && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    {t('emergency.statusDisabled')}
                  </span>
                </div>
              )}

              {/* Life-Saving Physical Card Preview */}
              <div className="border-2 border-red-500 rounded-3xl p-5 bg-gradient-to-br from-red-50/50 via-white to-rose-50/40 shadow-md space-y-4">
                
                {/* Patient Header */}
                <div className="flex items-start justify-between border-b border-red-200 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{t('emergency.title')}</span>
                    {visibleFields.includes('name') && (
                      <h3 className="text-xl font-black text-slate-900">{user?.name || 'Mrs. Sunita Sharma'}</h3>
                    )}
                    {visibleFields.includes('age') && (
                      <p className="text-xs text-slate-500">ABHA: 91-4523-8812-7019 • Age: 62</p>
                    )}
                  </div>
                  {visibleFields.includes('blood_group') && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 block">{t('emergency.bloodGroup')}</span>
                      <span className="text-2xl font-black text-red-600 px-3 py-0.5 bg-red-100 rounded-xl inline-block border border-red-200">
                        {profile?.blood_group || 'B+'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Critical Allergies - Highlighted with Warning style (PRD Section 7.6 & 7.10) */}
                {visibleFields.includes('allergies') && (
                  <div className="bg-red-100 border border-red-300 rounded-2xl p-3.5 text-red-950 flex items-start space-x-2.5">
                    <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-red-800">
                        {t('emergency.allergies')}:
                      </span>
                      <p className="text-sm font-black text-red-900 mt-0.5">
                        {allergies.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Chronic Conditions & Current Meds */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {visibleFields.includes('conditions') && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-1">{t('emergency.conditions')}:</span>
                      <p className="font-semibold text-slate-800">{conditions.join(', ')}</p>
                    </div>
                  )}
                  {visibleFields.includes('medicines') && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-1">{t('emergency.currentMeds')}:</span>
                      <p className="font-semibold text-slate-800">Metformin 500mg, Telmisartan 40mg</p>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                {visibleFields.includes('emergency_contact') && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-800 block text-[10px]">{t('emergency.contact')}:</span>
                      <span className="font-bold text-slate-900">{profile?.emergency_contact_name || 'Rohan Sharma (Son)'}</span>
                    </div>
                    <a
                      href={`tel:${profile?.emergency_contact_phone || '+919820112345'}`}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl shadow-xs hover:bg-emerald-700 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>SOS</span>
                    </a>
                  </div>
                )}

                {/* Printable QR Code section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={qrImageSrc}
                      alt="Emergency Medical QR"
                      className="w-24 h-24 rounded-xl border border-slate-300 p-1 bg-white shadow-xs"
                    />
                    <div className="text-xs text-slate-600 max-w-[200px]">
                      <p className="font-bold text-slate-900 mb-0.5">{t('emergency.scanWithoutLogin')}</p>
                      <p className="text-[11px] leading-tight text-slate-500">
                        {t('emergency.responderNotice')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 w-full sm:w-auto">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition shadow-xs cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{t('emergency.printCard')}</span>
                    </button>
                    <a
                      href={`/emergency/${token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 text-center"
                    >
                      <span>{t('emergency.testPublic')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
