import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { 
  Pill, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function MedicinesPage() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New med form state
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('Twice daily (1-0-1)');
  const [timing, setTiming] = useState('After meals (जेवणानंतर)');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [medRes, remRes] = await Promise.all([
        api.getMedicines(),
        api.getReminders()
      ]);
      setMedicines(medRes || []);
      setReminders(remRes || []);
    } catch (e) {
      console.error(e);
    }
  }

  const handleToggleMed = async (id) => {
    try {
      await api.toggleMedicine(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleReminder = async (id) => {
    try {
      await api.toggleReminder(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!name || !dose) return;
    try {
      await api.addMedicine({
        name,
        dose,
        frequency,
        timing,
        notes
      });
      setName('');
      setDose('');
      setNotes('');
      setShowAddForm(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const activeMeds = medicines.filter(m => m.is_active === 1);
  const pastMeds = medicines.filter(m => m.is_active === 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('nav.medicines')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            सध्या चालू असलेली औषधे, वेळापत्रक आणि आठवणी (Daily Schedule)
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन औषध जोडा</span>
        </button>
      </div>

      {/* Add Medicine Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddMedicine} className="bg-white border-2 border-teal-500 rounded-3xl p-6 shadow-md space-y-4 animate-scaleUp">
          <h3 className="font-bold text-slate-900 text-sm">नवीन औषध तपशील भरा</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">औषधाचे नाव (Medicine Name) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. Metformin 500mg किंवा Glimepiride"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">डोस (Dose / प्रमाण) *</label>
              <input
                type="text"
                required
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="उदा. 500 mg / 1 गोळी"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">वारंवारता (Frequency)</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="Once daily (1-0-0)">दिवसातून एकदा सकाळी (1-0-0)</option>
                <option value="Twice daily (1-0-1)">दिवसातून दोनदा सकाळ-संध्याकाळ (1-0-1)</option>
                <option value="Thrice daily (1-1-1)">दिवसातून तीनदा (1-1-1)</option>
                <option value="As needed (SOS)">गरज पडेल तेव्हा (SOS)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">वेळ (Timing / सूचना)</label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="Before meals (जेवणापूर्वी)">जेवणापूर्वी (Before meals)</option>
                <option value="After meals (जेवणानंतर)">जेवणानंतर (After meals)</option>
                <option value="Empty stomach (सकाळी रिकाम्या पोटी)">सकाळी रिकाम्या पोटी (Empty stomach)</option>
                <option value="At bedtime (झोपताना)">रात्री झोपताना (At bedtime)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
            >
              औषध सेव्ह करा
            </button>
          </div>
        </form>
      )}

      {/* Active Medicines List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Pill className="w-5 h-5 text-teal-600" />
          <span>{t('dashboard.activeMeds')} ({activeMeds.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeMeds.map((med) => (
            <div key={med.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{med.name}</h3>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mt-1">
                    {med.dose}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleMed(med.id)}
                  title="Mark as Stopped / Past"
                  className="text-xs text-slate-400 hover:text-red-600 font-semibold p-1"
                >
                  बंद करा
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-2xl">
                <p>🕒 वेळापत्रक: <strong>{med.frequency}</strong></p>
                <p>🍽️ सूचना: <strong>{med.timing}</strong></p>
                {med.notes && <p className="text-slate-500 text-[11px] mt-1">{med.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders & Follow-up Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-amber-950 text-lg">दैनिक गोळ्या व भेटींचे स्मरणपत्र (Reminders)</h2>
        </div>

        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              onClick={() => handleToggleReminder(r.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs sm:text-sm ${
                r.is_completed 
                  ? 'bg-white/40 border-slate-200 text-slate-400 line-through' 
                  : 'bg-white border-amber-300 text-slate-900 font-semibold shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle2 className={`w-5 h-5 ${r.is_completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span>{r.title}</span>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                {r.schedule_time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
