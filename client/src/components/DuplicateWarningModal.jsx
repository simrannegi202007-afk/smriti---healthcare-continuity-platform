import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, Check, ArrowRight } from 'lucide-react';

export default function DuplicateWarningModal({ duplicateInfo, onProceed, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-2 border-amber-400 animate-scaleUp">
        
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-center text-slate-900 mb-2">
          {t('upload.duplicateAlertTitle')}
        </h3>

        <p className="text-xs text-center text-slate-600 mb-4 leading-relaxed">
          {duplicateInfo?.matchType === 'hash'
            ? '⚠️ Identical File Match (SHA-256 Hash): An identical document file already exists in your timeline.'
            : (t('upload.duplicateAlertMsg') || 'A record with this date, hospital, and category already exists in your timeline.')}
        </p>

        {duplicateInfo?.existingRecord && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-xs mb-6 space-y-1">
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">{t('upload.hospital')}:</span>
              <span className="font-bold">{duplicateInfo.existingRecord.hospital}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">{t('upload.date')}:</span>
              <span className="font-bold">{duplicateInfo.existingRecord.date}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">{t('upload.category')}:</span>
              <span className="font-bold">{duplicateInfo.existingRecord.category}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="w-1/2 py-3 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs transition tap-target"
          >
            {t('upload.duplicateCancel')}
          </button>
          <button
            onClick={onProceed}
            className="w-1/2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-amber-600/20 tap-target"
          >
            {t('upload.duplicateProceed')}
          </button>
        </div>

      </div>
    </div>
  );
}
