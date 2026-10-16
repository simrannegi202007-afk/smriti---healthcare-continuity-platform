import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { ShieldCheck, Eye, Clock, Key, AlertTriangle, Trash2, Smartphone, Globe } from 'lucide-react';

export default function AccessLogPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await api.getAccessLogs();
        setLogs(res || []);
      } catch (err) {
        console.error('Failed to get access logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const handleDeleteAllData = async () => {
    if (window.confirm('सावधान: तुमचे सर्व वैद्यकीय रेकॉर्ड कायमचे नष्ट केले जातील. आपण खात्री केली आहे का?')) {
      try {
        await api.deleteMyData();
        alert('सर्व डेटा यशस्वीरीत्या हटवला गेला आहे.');
        window.location.reload();
      } catch (e) {
        alert('डेटा हटवताना त्रुटी आली.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>DPDP & ABDM Aligned Consent Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('accessLog.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t('accessLog.subtitle')}
          </p>
        </div>

        <button
          onClick={handleDeleteAllData}
          className="px-4 py-2 border border-red-300 hover:bg-red-50 text-red-700 rounded-2xl text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>सर्व डेटा कायमचा हटवा (Delete Data)</span>
        </button>
      </div>

      {/* Access Log Table / Card Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>नोंदींची संख्या: {logs.length}</span>
          <span className="text-teal-700">✓ सर्व प्रवेश संमतीने व मर्यादित आहेत</span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => {
            const isDoctor = log.channel === 'doctor_link';
            const isEmergency = log.channel === 'emergency_qr';
            return (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="flex items-start space-x-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white ${
                    isEmergency ? 'bg-red-600' : 'bg-blue-600'
                  }`}>
                    {isEmergency ? <Smartphone className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm">{log.accessor_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEmergency ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isEmergency ? 'Emergency QR' : 'Consented Doctor Link'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {log.action}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">
                      पाहिलेला तपशील: <strong className="text-slate-600">{log.records_viewed}</strong> • {log.ip_type}
                    </p>
                  </div>
                </div>

                <div className="text-right self-end sm:self-center">
                  <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
