import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Pill, 
  Scan, 
  Syringe, 
  Activity, 
  Sparkles, 
  Share2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Volume2,
  Calendar,
  Building2,
  User,
  Star,
  Eye,
  Trash2
} from 'lucide-react';

const categoryMeta = {
  'Lab report': { label: 'Lab Report', icon: Activity, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Prescription': { label: 'Prescription', icon: Pill, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Scan': { label: 'Scan / X-Ray', icon: Scan, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Discharge summary': { label: 'Discharge Summary', icon: FileText, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Vaccination': { label: 'Vaccination', icon: Syringe, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Other': { label: 'Medical Slip', icon: FileText, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
};

// Hospital tag colors for visual differentiation
const hospitalColors = {
  'K.E.M. Hospital': 'bg-indigo-100 text-indigo-900 border-indigo-200',
  'Lilavati Hospital': 'bg-teal-100 text-teal-900 border-teal-200',
  'Ruby Hall Clinic': 'bg-amber-100 text-amber-900 border-amber-200'
};

function getHospitalBadge(hospitalName) {
  for (const [key, color] of Object.entries(hospitalColors)) {
    if (hospitalName.includes(key)) return color;
  }
  return 'bg-slate-100 text-slate-800 border-slate-200';
}

export default function RecordCard({ 
  record, 
  onExplain, 
  onShare,
  onPreviewFile,
  onDelete,
  isSimple = false
}) {
  const { t } = useTranslation();
  const { language } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const meta = categoryMeta[record.category] || categoryMeta['Other'];
  const Icon = meta.icon;
  const hospitalBadgeClass = getHospitalBadge(record.hospital);

  const handleReadAloud = (e) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(
      `${record.date}, ${record.hospital}. ${record.category}. ${record.ai_summary}`
    );
    utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className={`rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md bg-white overflow-hidden ${
        record.is_key_moment ? 'ring-2 ring-amber-400 border-amber-300' : 'border-slate-200'
      }`}
    >
      {/* Key Moment Ribbon */}
      {record.is_key_moment === 1 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-4 py-1 flex items-center space-x-1.5">
          <Star className="w-3.5 h-3.5 fill-white" />
          <span>{t('timeline.keyMoment')} (महत्त्वपूर्ण घटना)</span>
        </div>
      )}

      {/* Main Card Header */}
      <div 
        onClick={() => setExpanded(!expanded)} 
        className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start space-x-4">
          {/* Category Icon Badge */}
          <div className={`w-12 h-12 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className={`w-6 h-6 ${meta.text}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Date */}
              <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{record.date}</span>
              </span>

              {/* Hospital Tag */}
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${hospitalBadgeClass}`}>
                {record.hospital}
              </span>

              {/* Abnormal Value Flag */}
              {record.has_abnormal && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center space-x-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>{t('timeline.abnormalValues')}</span>
                </span>
              )}
            </div>

            {/* Doctor & Category */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>{record.doctor || record.category}</span>
              <span className="text-xs font-normal text-slate-500">({record.category})</span>
            </h3>

            {/* One-Line Plain Language Summary */}
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
              {record.ai_summary}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          {/* Read Aloud button in simple mode */}
          <button
            onClick={handleReadAloud}
            title={t('timeline.readAloud')}
            className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* AI Explain button if lab report */}
          {record.category === 'Lab report' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExplain(record);
              }}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition tap-target"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('timeline.explainReport')}</span>
            </button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
              title="Delete this record"
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition tap-target"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="p-1 text-slate-400">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Details Pane */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-4 text-xs animate-fadeIn">
          
          {/* Lab Values Table if present */}
          {record.lab_values && record.lab_values.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                घटक आणि मूल्ये (Extracted Test Parameters):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {record.lab_values.map((lv, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block truncate">{lv.test_name}</span>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-sm font-black text-slate-900">{lv.value}</span>
                      <span className="text-[10px] text-slate-500">{lv.unit}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block mt-1 ${
                      lv.flag === 'high' ? 'bg-red-100 text-red-700' : lv.flag === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {lv.flag === 'high' ? '🔺 High' : lv.flag === 'low' ? '🔻 Low' : '✓ Normal'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
              <span className="font-bold text-slate-700 block mb-0.5">टीप (Clinical / Patient Notes):</span>
              <p>{record.notes}</p>
            </div>
          )}

          {/* File reference & Share button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 text-slate-500">
              <FileText className="w-4 h-4" />
              <span>फाईल: <strong>{record.file_name || 'Digitized Record'}</strong></span>
            </div>

            <div className="flex items-center space-x-2">
              {record.file_name && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewFile) onPreviewFile(record);
                  }}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition tap-target"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t('timeline.viewOriginalFile')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(record);
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold flex items-center space-x-1 shadow-sm transition tap-target"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('timeline.shareThis')}</span>
              </button>

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record);
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold flex items-center space-x-1 shadow-sm transition tap-target"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
