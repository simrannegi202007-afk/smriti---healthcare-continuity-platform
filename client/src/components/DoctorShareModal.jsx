import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { 
  X, 
  Share2, 
  Clock, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertOctagon, 
  ShieldCheck, 
  QrCode,
  Calendar,
  CheckSquare,
  Square,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export default function DoctorShareModal({ records: initialRecords = [], onClose }) {
  const { t } = useTranslation();
  
  // Consent options
  const [durationHours, setDurationHours] = useState(24);
  const [shareScope, setShareScope] = useState('ALL'); // 'ALL' or 'SELECTED'
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [requireOtp, setRequireOtp] = useState(false);
  const [otpPin, setOtpPin] = useState('1234');
  
  // Available user records to choose from
  const [allRecords, setAllRecords] = useState(initialRecords);
  const [activeShares, setActiveShares] = useState([]);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  useEffect(() => {
    loadActiveShares();
    if (allRecords.length === 0) {
      loadRecords();
    }
  }, []);

  async function loadRecords() {
    try {
      const res = await api.getRecords();
      setAllRecords(res.records || []);
      // default select all
      setSelectedRecordIds((res.records || []).map(r => r.id));
    } catch (e) {
      console.error('Failed to load records for share selection:', e);
    }
  }

  async function loadActiveShares() {
    try {
      const res = await api.listActiveShares();
      setActiveShares(res.shares || []);
    } catch (e) {
      console.error('Failed to load active shares:', e);
    }
  }

  const toggleRecord = (id) => {
    if (selectedRecordIds.includes(id)) {
      setSelectedRecordIds(selectedRecordIds.filter(i => i !== id));
    } else {
      setSelectedRecordIds([...selectedRecordIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecordIds.length === allRecords.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(allRecords.map(r => r.id));
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const recordPayload = shareScope === 'ALL' ? 'ALL' : selectedRecordIds;
      const res = await api.createShareLink({
        durationHours,
        recordIds: recordPayload,
        otp: requireOtp ? otpPin : ''
      });

      const fullUrl = `${window.location.origin}/shared/doctor/${res.token}`;
      setGeneratedLink({
        ...res,
        fullUrl,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fullUrl)}`
      });
      await loadActiveShares();
    } catch (err) {
      console.error('Failed to create share link:', err);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (shareId, token) => {
    setRevokingId(shareId || token);
    try {
      // Optimistically update local activeShares immediately so revoked status renders right away
      setActiveShares(prev => prev.map(s => 
        (s.id === shareId || s.token === token) ? { ...s, is_revoked: 1 } : s
      ));

      if (generatedLink?.shareId === shareId || generatedLink?.token === token) {
        setGeneratedLink(prev => prev ? { ...prev, is_revoked: 1 } : null);
      }

      await api.revokeShareLink({ shareId, token });
      await loadActiveShares();
    } catch (err) {
      console.error('Failed to revoke:', err);
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopy = () => {
    if (!generatedLink?.fullUrl) return;
    navigator.clipboard.writeText(generatedLink.fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-5 flex items-center justify-between border-b border-indigo-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-2xl border border-white/20">
              <Share2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black">{t('share.title')}</h2>
              </div>
              <p className="text-xs text-blue-100">{t('share.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          
          {/* Quick Demo Pre-Seeded Links Strip */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-indigo-950 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('share.demoLinksTitle')}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="/shared/doctor/demo-doctor-direct"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-xl font-bold text-indigo-700 flex items-center space-x-1 shadow-xs transition"
              >
                <span>{t('share.instantLink')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="/shared/doctor/demo-doc-24h"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-xl font-bold text-indigo-700 flex items-center space-x-1 shadow-xs transition"
              >
                <span>{t('share.pinProtectedLink')} (PIN: 1234)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="/shared/doctor/demo-doc-expired"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-red-50 border border-red-300 rounded-xl font-bold text-red-700 flex items-center space-x-1 shadow-xs transition"
              >
                <span>{t('share.expiredLink')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="/shared/doctor/demo-doc-revoked"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl font-bold text-rose-700 flex items-center space-x-1 shadow-xs transition"
              >
                <span>{t('share.revokedLink')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 1. Expiry Duration Selector (1h, 24h, 7d) */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              1. {t('share.selectExpiry')}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { hours: 1, label: t('share.exp1h') },
                { hours: 24, label: t('share.exp24h') },
                { hours: 168, label: t('share.exp7d') }
              ].map((d) => (
                <button
                  key={d.hours}
                  type="button"
                  onClick={() => setDurationHours(d.hours)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition tap-target ${
                    durationHours === d.hours
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/30 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Clock className={`w-4 h-4 mx-auto mb-1 ${durationHours === d.hours ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="leading-tight block">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Record Selection Scope (PRD 7.9) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                2. {t('share.selectRecords')}
              </label>
              <div className="flex space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShareScope('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    shareScope === 'ALL'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t('share.shareAll')} ({allRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShareScope('SELECTED')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    shareScope === 'SELECTED'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t('share.selectSpecific')} ({selectedRecordIds.length})
                </button>
              </div>
            </div>

            {shareScope === 'ALL' ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('share.shareAll')}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Doctor will receive consented access to patient profile, critical allergies, active medications, all {allRecords.length} hospital records, and 2-year lab trends.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto bg-slate-50/50">
                <div className="p-2.5 bg-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{t('share.selectSpecific')}:</span>
                  <button 
                    type="button"
                    onClick={handleSelectAll}
                    className="text-indigo-600 hover:underline"
                  >
                    {selectedRecordIds.length === allRecords.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                {allRecords.map((rec) => {
                  const isChecked = selectedRecordIds.includes(rec.id);
                  return (
                    <div 
                      key={rec.id}
                      onClick={() => toggleRecord(rec.id)}
                      className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-indigo-50/50 transition text-xs ${
                        isChecked ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="text-indigo-600 flex-shrink-0">
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{rec.hospital}</span>
                          <span className="font-semibold text-slate-500">• {rec.date}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-slate-600 truncate text-[11px] mt-0.5">{rec.ai_summary || rec.doctor}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Optional OTP PIN */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-white shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Lock className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t('share.requireOtp')}</span>
                <span className="text-[11px] text-slate-500">{t('share.otpPlaceholder')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {requireOtp && (
                <input
                  type="text"
                  maxLength="6"
                  value={otpPin}
                  onChange={(e) => setOtpPin(e.target.value)}
                  className="w-20 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                  placeholder="1234"
                />
              )}
              <input
                type="checkbox"
                checked={requireOtp}
                onChange={(e) => setRequireOtp(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Explicit Patient Informed Consent Screen (PRD Section 7.9 & 9) */}
          <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center space-x-2 font-black text-emerald-900 text-sm">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>{t('share.consentNoticeTitle')}</span>
            </div>
            <p className="text-emerald-900 leading-relaxed font-medium">
              {t('share.consentNoticeBody', {
                duration: durationHours === 1 ? '1 Hour' : durationHours === 24 ? '24 Hours' : '7 Days',
                scope: shareScope === 'ALL' ? 'all medical records' : `${selectedRecordIds.length} selected records`
              })}
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateLink}
            disabled={loading || (shareScope === 'SELECTED' && selectedRecordIds.length === 0)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 tap-target disabled:opacity-50 text-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('share.generateLink')}</span>
          </button>

          {/* Generated Share Link & QR Code Display */}
          {generatedLink && (
            <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/70 to-slate-50 border-2 border-indigo-300 rounded-3xl p-5 space-y-4 animate-fadeIn shadow-sm">
              
              <div className="flex items-center justify-between text-xs border-b border-indigo-100 pb-2">
                <span className="font-extrabold text-indigo-950 text-sm flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{t('share.linkReady')}</span>
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  {t('share.validDuration', { hours: durationHours })}
                </span>
              </div>

              {/* QR Code and Instructions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-indigo-200">
                <img
                  src={generatedLink.qrUrl}
                  alt="Doctor Summary QR"
                  className="w-32 h-32 rounded-xl border border-slate-200 p-1 bg-white shadow-xs"
                />
                <div className="text-xs space-y-1.5 text-slate-700">
                  <h4 className="font-black text-slate-900 text-sm">{t('share.doctorPreview')}</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {t('share.scanQrInstruction')}
                  </p>
                  {requireOtp && (
                    <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 font-bold text-xs inline-block">
                      PIN: <span className="font-mono text-sm tracking-widest">{otpPin}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* URL with Copy Button */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">{t('share.orShareLink')}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink.fullUrl}
                    className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-indigo-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t('share.linkCopied') : t('share.copyLink')}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={`/shared/doctor/${generatedLink.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 font-black hover:underline flex items-center space-x-1"
                >
                  <span>{t('share.doctorPreview')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-slate-400 text-[10px]">Server-side auto expiry enforced</span>
              </div>
            </div>
          )}

          {/* Active Shares List with Immediate Revoke Action (PRD 7.9) */}
          {activeShares.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('share.activeShares')} ({activeShares.length})</span>
              </h4>
              <div className="space-y-2">
                {activeShares.map((s) => {
                  const isRevoked = s.is_revoked === 1;
                  const isExpired = new Date(s.expires_at) < new Date();
                  const isCurrentlyRevoking = revokingId === s.id || revokingId === s.token;

                  return (
                    <div key={s.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            Token: ...{s.token.slice(-12)}
                          </span>
                          {isRevoked ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                              {t('share.revoked')}
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                              {t('share.expired')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {t('share.active')}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {t('share.activeUntil', { time: new Date(s.expires_at).toLocaleString() })} • {s.record_ids === 'ALL' ? t('share.shareAll') : t('share.selectSpecific')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <a
                          href={`/shared/doctor/${s.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold"
                        >
                          {t('share.doctorPreview')}
                        </a>
                        
                        {!isRevoked && !isExpired && (
                          <button
                            type="button"
                            disabled={isCurrentlyRevoking}
                            onClick={() => handleRevoke(s.id, s.token)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-50"
                          >
                            {isCurrentlyRevoking ? t('share.revoking') : t('share.revoke')}
                          </button>
                        )}

                        {isRevoked && (
                          <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                            {t('share.revoked')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
