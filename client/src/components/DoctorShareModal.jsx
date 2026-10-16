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
  Calendar
} from 'lucide-react';

export default function DoctorShareModal({ records = [], onClose }) {
  const { t } = useTranslation();
  const [durationHours, setDurationHours] = useState(24);
  const [requireOtp, setRequireOtp] = useState(false);
  const [otpPin, setOtpPin] = useState('1234');
  const [activeShares, setActiveShares] = useState([]);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveShares();
  }, []);

  async function loadActiveShares() {
    try {
      const res = await api.listActiveShares();
      setActiveShares(res.shares || []);
    } catch (e) {
      console.error(e);
    }
  }

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const res = await api.createShareLink({
        durationHours,
        recordIds: 'ALL',
        otp: requireOtp ? otpPin : ''
      });
      const fullUrl = `${window.location.origin}/shared/doctor/${res.token}`;
      setGeneratedLink({
        ...res,
        fullUrl
      });
      loadActiveShares();
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await api.revokeShareLink({ shareId });
      loadActiveShares();
      if (generatedLink?.shareId === shareId) {
        setGeneratedLink(null);
      }
    } catch (err) {
      console.error('Failed to revoke:', err);
    }
  };

  const handleCopy = () => {
    if (!generatedLink?.fullUrl) return;
    navigator.clipboard.writeText(generatedLink.fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <Share2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('share.title')}</h2>
              <p className="text-xs text-blue-100">{t('share.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          
          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              {t('share.selectExpiry')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { hours: 1, label: t('share.exp1h') },
                { hours: 24, label: t('share.exp24h') },
                { hours: 168, label: t('share.exp7d') }
              ].map((d) => (
                <button
                  key={d.hours}
                  type="button"
                  onClick={() => setDurationHours(d.hours)}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-center transition ${
                    durationHours === d.hours
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scope of Records */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('share.shareAll')}</span>
            </div>
            <p className="text-slate-500">
              Doctor will see: Blood group, allergies, 3 active medicines, 9 cross-hospital timeline records, and HbA1c/Hemoglobin trend graphs.
            </p>
          </div>

          {/* OTP PIN toggle */}
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">{t('share.requireOtp')}</span>
            </div>
            <input
              type="checkbox"
              checked={requireOtp}
              onChange={(e) => setRequireOtp(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 tap-target"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('share.generateLink')}</span>
          </button>

          {/* Newly Generated Share Link Box */}
          {generatedLink && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900">🔗 तयार झालेली सुरक्षित डॉक्टर लिंक:</span>
                <span className="text-emerald-700 font-semibold">वैध: {durationHours} तास</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink.fullUrl}
                  className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-indigo-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('share.linkCopied') : t('share.copyLink')}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={`/shared/doctor/${generatedLink.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>{t('share.doctorPreview')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-500 text-[11px]">Server enforces auto-expiry</span>
              </div>
            </div>
          )}

          {/* Active Shares List with Revoke Option */}
          {activeShares.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('share.activeShares')} ({activeShares.length})
              </h4>
              <div className="space-y-2">
                {activeShares.map((s) => (
                  <div key={s.id} className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-sm">
                    <div>
                      <div className="font-semibold text-slate-800 font-mono">
                        ...{s.token.slice(-10)}
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {t('share.activeUntil', { time: new Date(s.expires_at).toLocaleString() })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/shared/doctor/${s.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => handleRevoke(s.id)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold"
                      >
                        {t('share.revoke')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
