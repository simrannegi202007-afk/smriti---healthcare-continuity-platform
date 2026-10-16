import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Edit2, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileText
} from 'lucide-react';

export default function ExplainModal({ record, onClose }) {
  const { t } = useTranslation();
  const { language } = useAuth();

  const [step, setStep] = useState(1); // 1: Verify Extracted Values, 2: Explanation
  const [loading, setLoading] = useState(false);
  const [extractedValues, setExtractedValues] = useState([]);
  const [explanationData, setExplanationData] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load extracted values for this report
  useEffect(() => {
    async function loadValues() {
      setLoading(true);
      try {
        const res = await api.extractReportValues(record.id);
        setExtractedValues(res.extractedValues || []);
      } catch (err) {
        console.error('Failed to extract values:', err);
      } finally {
        setLoading(false);
      }
    }
    loadValues();
  }, [record.id]);

  // Handle user manual adjustment on verification screen
  const handleValueChange = (index, field, newVal) => {
    const updated = [...extractedValues];
    updated[index][field] = newVal;
    // Auto-update flag if value changed
    if (field === 'value') {
      const num = parseFloat(newVal);
      if (updated[index].test_name.includes('HbA1c')) {
        updated[index].flag = num > 5.6 ? (num > 7.0 ? 'high' : 'normal') : 'normal';
      } else if (updated[index].test_name.includes('Sugar')) {
        updated[index].flag = num > 125 ? 'high' : (num < 70 ? 'low' : 'normal');
      }
    }
    setExtractedValues(updated);
  };

  // Step 2: Confirm and generate explanation in current language
  const handleConfirmAndExplain = async () => {
    setLoading(true);
    try {
      const res = await api.explainReport({
        recordId: record.id,
        verifiedValues: extractedValues,
        language: language || 'mr'
      });
      setExplanationData(res);
      setStep(2);
    } catch (err) {
      console.error('Failed to explain report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Text-to-speech read aloud
  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${explanationData.explanation}. ${explanationData.disclaimer}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('ai.title')}</h2>
              <p className="text-xs text-teal-100">{record.hospital} • {record.date}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
              <p className="text-sm font-medium">{t('ai.extracting')}</p>
            </div>
          ) : step === 1 ? (
            /* STEP 1: VERIFICATION SCREEN */
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">{t('ai.verifyStep')}</h4>
                  <p className="mt-0.5">{t('ai.verifyPrompt')}</p>
                </div>
              </div>

              {/* Table of extracted values */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t('ai.testName')}</th>
                      <th className="p-3">{t('ai.result')}</th>
                      <th className="p-3 hidden sm:table-cell">{t('ai.normalRange')}</th>
                      <th className="p-3">{t('ai.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractedValues.map((val, idx) => {
                      const isHigh = val.flag === 'high';
                      const isLow = val.flag === 'low';
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800">
                            {val.test_name}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <input 
                                type="text"
                                value={val.value}
                                onChange={(e) => handleValueChange(idx, 'value', e.target.value)}
                                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                              <span className="text-xs text-slate-500">{val.unit}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 hidden sm:table-cell">
                            {val.reference_range} {val.unit}
                          </td>
                          <td className="p-3">
                            {isHigh ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                🔺 {t('ai.high')}
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                🔻 {t('ai.low')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ {t('ai.normal')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action button */}
              <button
                onClick={handleConfirmAndExplain}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center space-x-2 tap-target"
              >
                <span>{t('ai.confirmAndExplain')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* STEP 2: PLAIN-LANGUAGE EXPLANATION */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Highlights Chips */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('ai.explanationTitle', { lang: language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिंदी' : 'English' })}
                </h4>
                <div className="space-y-1.5">
                  {explanationData?.keyHighlights?.map((hl, i) => (
                    <div key={i} className="text-xs sm:text-sm font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Detailed Explanation Card */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5 text-slate-800 leading-relaxed text-sm sm:text-base font-medium shadow-sm">
                <p>{explanationData?.explanation}</p>
              </div>

              {/* Read Aloud Voice Button */}
              <button
                onClick={handleToggleSpeech}
                className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 font-bold text-sm transition tap-target ${
                  isSpeaking 
                    ? 'bg-red-50 text-red-700 border-red-300' 
                    : 'bg-white hover:bg-teal-50 text-teal-800 border-teal-300 shadow-sm'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5 text-red-600" />
                    <span>{t('ai.audioStop')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-teal-600" />
                    <span>{t('ai.audioPlay', { lang: language === 'mr' ? 'मराठीत' : language === 'hi' ? 'हिंदी में' : 'in English' })}</span>
                  </>
                )}
              </button>

              {/* Mandatory Medical Disclaimer Box */}
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-xs text-red-900 flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">
                  {explanationData?.disclaimer}
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/2 py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← {t('ai.verifyStep')}
                </button>
                <button
                  onClick={onClose}
                  className="w-1/2 py-2.5 px-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  ठीक आहे (Close)
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
