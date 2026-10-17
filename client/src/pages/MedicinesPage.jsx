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
import { getMedicineTimingLabel, getMedicineFrequencyLabel } from '../utils/medicineUtils';

export default function MedicinesPage() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New med form state (stored as standard codes)
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('Twice daily (1-0-1)');
  const [timing, setTiming] = useState('AFTER_MEALS');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('Ongoing');
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
        start_date: startDate,
        duration,
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
            {t('medicinesPage.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t('medicinesPage.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/20 self-start sm:self-auto tap-target"
          aria-label={t('medicinesPage.addNew')}
        >
          <Plus className="w-4 h-4" />
          <span>{t('medicinesPage.addNew')}</span>
        </button>
      </div>

      {/* Add Medicine Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddMedicine} className="bg-white border-2 border-teal-500 rounded-3xl p-6 shadow-md space-y-4 animate-scaleUp">
          <h3 className="font-bold text-slate-900 text-sm">{t('medicinesPage.formTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="medName" className="block font-bold text-slate-700 mb-1">{t('medicinesPage.medName')} *</label>
              <input
                id="medName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('medicinesPage.medNamePlaceholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="medDose" className="block font-bold text-slate-700 mb-1">{t('medicinesPage.dose')} *</label>
              <input
                id="medDose"
                type="text"
                required
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder={t('medicinesPage.dosePlaceholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="medFreq" className="block font-bold text-slate-700 mb-1">{t('medicinesPage.frequency')}</label>
              <select
                id="medFreq"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="Once daily (1-0-0)">{t('medicinesPage.freqOnce')}</option>
                <option value="Twice daily (1-0-1)">{t('medicinesPage.freqTwice')}</option>
                <option value="Thrice daily (1-1-1)">{t('medicinesPage.freqThrice')}</option>
                <option value="As needed (SOS)">{t('medicinesPage.freqSos')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="medTiming" className="block font-bold text-slate-700 mb-1">{t('medicinesPage.timing')}</label>
              <select
                id="medTiming"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="BEFORE_MEALS">{t('medicinesPage.timingBefore')}</option>
                <option value="AFTER_MEALS">{t('medicinesPage.timingAfter')}</option>
                <option value="BEFORE_BREAKFAST">{t('medicinesPage.timingBeforeBreakfast')}</option>
                <option value="AFTER_LUNCH">{t('medicinesPage.timingAfterLunch')}</option>
                <option value="EMPTY_STOMACH">{t('medicinesPage.timingEmpty')}</option>
                <option value="BEDTIME">{t('medicinesPage.timingBedtime')}</option>
                <option value="AS_NEEDED">{t('medicinesPage.timingSos')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="medStart" className="block font-bold text-slate-700 mb-1">{t('medicinesPage.startDate')}</label>
              <input
                id="medStart"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="medDuration" className="block font-bold text-slate-700 mb-1">{t('medicinesPage.duration')}</label>
              <input
                id="medDuration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t('medicinesPage.durationPlaceholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 tap-target"
            >
              {t('medicinesPage.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 tap-target"
            >
              {t('medicinesPage.save')}
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
                  title={t('medicinesPage.stop')}
                  aria-label={`${t('medicinesPage.stop')} ${med.name}`}
                  className="text-xs text-slate-400 hover:text-red-600 font-semibold p-1.5 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 transition"
                >
                  {t('medicinesPage.stop')}
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <p>🕒 {t('medicinesPage.schedule')}: <strong>{getMedicineFrequencyLabel(med.frequency, t)}</strong></p>
                <p>🍽️ {t('medicinesPage.instructions')}: <strong>{getMedicineTimingLabel(med.timing, t)}</strong></p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                  <span>📅 {t('medicinesPage.started')}: <strong>{med.start_date || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>⏳ {t('medicinesPage.durationLabel')}: <strong>{med.duration || 'Ongoing'}</strong></span>
                </div>
                {med.source_record_id && (
                  <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 mt-1">
                    📄 {t('medicinesPage.derivedRx')}
                  </span>
                )}
                {med.notes && <p className="text-slate-500 text-[11px] mt-1 italic">{med.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders & Follow-up Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-amber-950 text-lg">{t('medicinesPage.remindersTitle')}</h2>
        </div>

        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              onClick={() => handleToggleReminder(r.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs sm:text-sm tap-target ${
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
