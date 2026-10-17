import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Eye, 
  Clock, 
  Key, 
  AlertTriangle, 
  Trash2, 
  Smartphone, 
  Globe, 
  FileText,
  Lock,
  Search,
  Filter,
  UserCheck,
  RefreshCw,
  Share2
} from 'lucide-react';

function getLogDetails(log, t) {
  const actionKey = log.action || '';
  
  // 1. Action Title & Description Translation
  let actionTitle = t(`accessLog.actions.${actionKey}.title`, { defaultValue: '' });
  let actionDesc = t(`accessLog.actions.${actionKey}.desc`, { defaultValue: '' });

  // Intelligent fallback for legacy sentence entries or variants
  if (!actionTitle) {
    if (actionKey.includes('Created') || actionKey.includes('DOCTOR_LINK_CREATED')) {
      actionTitle = t('accessLog.actions.DOCTOR_LINK_CREATED.title');
      actionDesc = t('accessLog.actions.DOCTOR_LINK_CREATED.desc');
    } else if (actionKey.includes('REVOKED') || actionKey.includes('ACCESS_DENIED_REVOKED')) {
      actionTitle = t('accessLog.actions.ACCESS_DENIED_REVOKED.title');
      actionDesc = t('accessLog.actions.ACCESS_DENIED_REVOKED.desc');
    } else if (actionKey.includes('EXPIRED') || actionKey.includes('ACCESS_DENIED_EXPIRED')) {
      actionTitle = t('accessLog.actions.ACCESS_DENIED_EXPIRED.title');
      actionDesc = t('accessLog.actions.ACCESS_DENIED_EXPIRED.desc');
    } else if (actionKey.includes('Revoked') || actionKey.includes('LINK_REVOKED')) {
      actionTitle = t('accessLog.actions.LINK_REVOKED.title');
      actionDesc = t('accessLog.actions.LINK_REVOKED.desc');
    } else if (actionKey.includes('Emergency') || actionKey.includes('EMERGENCY_CARD_VIEWED') || actionKey.includes('Scanned')) {
      actionTitle = t('accessLog.actions.EMERGENCY_CARD_VIEWED.title');
      actionDesc = t('accessLog.actions.EMERGENCY_CARD_VIEWED.desc');
    } else if (actionKey.includes('note') || actionKey.includes('DOCTOR_NOTE_ADDED')) {
      actionTitle = t('accessLog.actions.DOCTOR_NOTE_ADDED.title');
      actionDesc = t('accessLog.actions.DOCTOR_NOTE_ADDED.desc');
    } else if (actionKey.includes('document') || actionKey.includes('DOCUMENT_VIEWED') || actionKey.includes('Inspected')) {
      actionTitle = t('accessLog.actions.DOCUMENT_VIEWED.title');
      actionDesc = t('accessLog.actions.DOCUMENT_VIEWED.desc');
    } else {
      actionTitle = t('accessLog.actions.DOCTOR_LINK_OPENED.title');
      actionDesc = t('accessLog.actions.DOCTOR_LINK_OPENED.desc');
    }
  }

  // 2. Actor Label Translation
  const actorKey = log.accessor_name || '';
  let actorLabel = t(`accessLog.actors.${actorKey}`, { defaultValue: '' });
  if (!actorLabel) {
    if (actorKey === 'Visiting Consulting Doctor' || actorKey === 'VISITING_DOCTOR') {
      actorLabel = t('accessLog.actors.VISITING_DOCTOR');
    } else if (actorKey.includes('Patient (Consented') || actorKey === 'PATIENT_CONSENT') {
      actorLabel = t('accessLog.actors.PATIENT_CONSENT');
    } else if (actorKey.includes('Patient (Revocation') || actorKey === 'PATIENT_REVOCATION') {
      actorLabel = t('accessLog.actors.PATIENT_REVOCATION');
    } else if (actorKey === 'Patient' || actorKey === 'PATIENT') {
      actorLabel = t('accessLog.actors.PATIENT');
    } else if (actorKey.includes('Emergency') || actorKey === 'EMERGENCY_RESPONDER') {
      actorLabel = t('accessLog.actors.EMERGENCY_RESPONDER');
    } else if (actorKey.includes('Apollo') || actorKey === 'CASUALTY_DESK') {
      actorLabel = t('accessLog.actors.CASUALTY_DESK');
    } else if (actorKey.includes('Arvind Patil') || actorKey === 'DOC_PATIL') {
      actorLabel = t('accessLog.actors.DOC_PATIL');
    } else if (actorKey.includes('Joshi') || actorKey === 'DOC_JOSHI') {
      actorLabel = t('accessLog.actors.DOC_JOSHI');
    } else {
      actorLabel = actorKey;
    }
  }

  // 3. Platform Label Translation
  const platformKey = log.ip_type || '';
  let platformLabel = t(`accessLog.platforms.${platformKey}`, { defaultValue: '' });
  if (!platformLabel) {
    if (platformKey.includes('Patient') || platformKey === 'PATIENT_PORTAL') {
      platformLabel = t('accessLog.platforms.PATIENT_PORTAL');
    } else if (platformKey.includes('Doctor Portal') || platformKey === 'DOCTOR_PORTAL') {
      platformLabel = t('accessLog.platforms.DOCTOR_PORTAL');
    } else if (platformKey.includes('Clinical') || platformKey === 'CLINICAL_LINK') {
      platformLabel = t('accessLog.platforms.CLINICAL_LINK');
    } else if (platformKey.includes('Mobile') || platformKey.includes('SOS') || platformKey === 'EMERGENCY_SCAN') {
      platformLabel = t('accessLog.platforms.EMERGENCY_SCAN');
    } else if (platformKey.includes('Document') || platformKey === 'DOCUMENT_VIEWER') {
      platformLabel = t('accessLog.platforms.DOCUMENT_VIEWER');
    } else if (platformKey.includes('Intranet') || platformKey === 'HOSPITAL_INTRANET') {
      platformLabel = t('accessLog.platforms.HOSPITAL_INTRANET');
    } else {
      platformLabel = platformKey;
    }
  }

  // 4. Badge Translation
  const isEmergency = log.channel === 'emergency_qr';
  const isDocument = log.action === 'DOCUMENT_VIEWED' || (log.action || '').toLowerCase().includes('document');
  const badgeLabel = isEmergency 
    ? t('accessLog.badges.emergency') 
    : isDocument 
    ? t('accessLog.badges.document') 
    : t('accessLog.badges.doctor');

  // 5. Records Viewed Translation
  const rec = log.records_viewed || '';
  let recordsLabel = rec;
  if (rec === 'ALL' || rec === 'ALL_RECORDS' || rec.includes('All 9') || rec.includes('All Medical')) {
    recordsLabel = t('accessLog.records.all');
  } else if (rec === 'EMERGENCY_FIELDS' || rec.includes('Visible fields') || rec.includes('blood_group')) {
    recordsLabel = t('accessLog.records.emergency');
  } else if (rec === 'NONE' || rec.includes('Terminated') || rec.includes('None') || rec.includes('Blocked')) {
    recordsLabel = t('accessLog.records.none');
  } else if (rec.includes('Record #4') || rec === 'RECORD_#4') {
    recordsLabel = t('accessLog.records.record4');
  } else if (rec.includes('Record #8') || rec === 'RECORD_#8') {
    recordsLabel = t('accessLog.records.record8');
  }

  return {
    actionTitle,
    actionDesc,
    actorLabel,
    platformLabel,
    badgeLabel,
    recordsLabel,
    isEmergency,
    isDocument
  };
}

export default function AccessLogPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('ALL'); // 'ALL', 'doctor_link', 'emergency_qr'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await api.getAccessLogs();
      const list = Array.isArray(res) ? res : (res?.logs || []);
      setLogs(list);
    } catch (err) {
      console.error('Failed to get access logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteAllData = async () => {
    const confirmation = window.confirm(t('accessLog.deletePrompt'));
    if (confirmation) {
      try {
        await api.deleteMyData();
        alert(t('accessLog.dataDeleted'));
        window.location.reload();
      } catch (e) {
        alert(t('accessLog.deleteFailed'));
      }
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterChannel !== 'ALL' && log.channel !== filterChannel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const details = getLogDetails(log, t);
      const matchName = (details.actorLabel || '').toLowerCase().includes(q) || (log.accessor_name || '').toLowerCase().includes(q);
      const matchAction = (details.actionTitle || '').toLowerCase().includes(q) || (details.actionDesc || '').toLowerCase().includes(q) || (log.action || '').toLowerCase().includes(q);
      const matchRecords = (details.recordsLabel || '').toLowerCase().includes(q) || (log.records_viewed || '').toLowerCase().includes(q);
      const matchPlatform = (details.platformLabel || '').toLowerCase().includes(q) || (log.ip_type || '').toLowerCase().includes(q);
      return matchName || matchAction || matchRecords || matchPlatform;
    }
    return true;
  });

  const doctorCount = logs.filter(l => l.channel === 'doctor_link').length;
  const emergencyCount = logs.filter(l => l.channel === 'emergency_qr').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>DPDP & ABDM Aligned Consent Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('accessLog.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {t('accessLog.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition tap-target cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleDeleteAllData}
            className="px-4 py-2.5 border-2 border-red-300 hover:bg-red-50 text-red-700 rounded-2xl text-xs font-black flex items-center space-x-1.5 transition tap-target shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('accessLog.deleteData')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">
            {t('accessLog.totalLogs')}
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{logs.length}</span>
            <span className="text-teal-700 font-semibold">{t('accessLog.consentedNotice')}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">
            {t('accessLog.doctorAccess')}
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-indigo-700">{doctorCount}</span>
            <span className="text-slate-500 font-medium">{t('accessLog.timeLimitedLinks')}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">
            {t('accessLog.emergencyScans')}
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-red-600">{emergencyCount}</span>
            <span className="text-slate-500 font-medium">{t('accessLog.lifeSavingTriage')}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="font-bold text-slate-500 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{t('accessLog.filterLabel')}</span>
          </span>
          <div className="flex space-x-1.5">
            {[
              { id: 'ALL', label: t('accessLog.filterAll') },
              { id: 'doctor_link', label: t('accessLog.filterDoctor') },
              { id: 'emergency_qr', label: t('accessLog.filterEmergency') }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterChannel(f.id)}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                  filterChannel === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('accessLog.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Access Log Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>{t('accessLog.recordsCount', { count: filteredLogs.length })}</span>
          <span className="text-teal-700 font-extrabold flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>{t('accessLog.tamperEvident')}</span>
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {t('accessLog.noLogs')}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const details = getLogDetails(log, t);
              
              return (
                <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-xs ${
                      details.isEmergency ? 'bg-red-600' : details.isDocument ? 'bg-indigo-600' : 'bg-blue-600'
                    }`}>
                      {details.isEmergency ? <Smartphone className="w-5 h-5" /> : details.isDocument ? <FileText className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {details.actorLabel}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          details.isEmergency 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : details.isDocument
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {details.badgeLabel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-900 font-bold">
                        {details.actionTitle}
                      </p>
                      
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {details.actionDesc}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        {t('accessLog.scopeViewed')} <strong className="text-slate-800 font-bold">{details.recordsLabel}</strong> • {t('accessLog.platform')}: <span className="font-medium text-slate-600">{details.platformLabel}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-500 flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
