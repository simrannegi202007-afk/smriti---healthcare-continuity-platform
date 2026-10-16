import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ShieldAlert, 
  Loader2, 
  Plus, 
  Trash2, 
  Languages, 
  RotateCcw 
} from 'lucide-react';

const UI_TEXT = {
  en: {
    title: 'Explain Lab Report',
    step1: 'Verify Values',
    step2: 'Plain-Language Explanation',
    verifyAlertTitle: 'Verify Extracted Values',
    verifyAlertDesc: 'Please confirm the values extracted from your report before generating the patient explanation. You can edit values or normal ranges below.',
    testName: 'Test Name',
    result: 'Result',
    normalRange: 'Normal Range',
    status: 'Status',
    action: 'Action',
    addTest: 'Add Test Parameter',
    totalVerified: (n) => `Total: ${n} tests verified`,
    confirmAndExplain: 'Verify & Generate Plain-Language Explanation',
    generating: 'Generating AI Explanation...',
    extracting: 'Extracting lab values from report...',
    currentLang: 'Language:',
    keyHighlights: 'Key Findings',
    explanationTitle: 'Plain-Language Summary',
    verifiedParams: 'Verified Parameters',
    listenVoice: 'Listen in English',
    stopVoice: 'Stop Voice',
    disclaimerHeader: 'Mandatory Medical Disclaimer',
    disclaimer: 'This explains your report in simple words. It is not a diagnosis. Please consult your doctor.',
    backToStep1: '← Edit Values',
    doneClose: 'Done / Close',
    statusHigh: 'High',
    statusLow: 'Low',
    statusNormal: 'Normal'
  },
  hi: {
    title: 'जांच रिपोर्ट का सरल अर्थ',
    step1: 'मान सत्यापित करें',
    step2: 'सरल भाषा में स्पष्टीकरण',
    verifyAlertTitle: 'जांच मान सत्यापित करें',
    verifyAlertDesc: 'कृपया रिपोर्ट से निकाले गए मानों की पुष्टि करें। आप नीचे दिए गए मान या संदर्भ सीमा संपादित कर सकते हैं।',
    testName: 'टेस्ट का नाम',
    result: 'परिणाम',
    normalRange: 'सामान्य सीमा',
    status: 'स्थिति',
    action: 'कार्रवाई',
    addTest: 'नया टेस्ट जोड़ें',
    totalVerified: (n) => `कुल: ${n} टेस्ट सत्यापित`,
    confirmAndExplain: 'सत्यापित करें और सरल भाषा में समझें',
    generating: 'स्पष्टीकरण तैयार किया जा रहा है...',
    extracting: 'रिपोर्ट से मान निकाले जा रहे हैं...',
    currentLang: 'भाषा:',
    keyHighlights: 'मुख्य निष्कर्ष',
    explanationTitle: 'सरल भाषा में सारांश',
    verifiedParams: 'सत्यापित मान',
    listenVoice: 'हिंदी में सुनें',
    stopVoice: 'आवाज़ बंद करें',
    disclaimerHeader: 'अनिवार्य चिकित्सीय अस्वीकरण',
    disclaimer: 'यह आपकी रिपोर्ट को सरल शब्दों में समझाता है। यह कोई निदान नहीं है। कृपया अपने डॉक्टर से परामर्श करें। (This explains your report in simple words. It is not a diagnosis. Please consult your doctor.)',
    backToStep1: '← मान संपादित करें',
    doneClose: 'पूर्ण / बंद करें',
    statusHigh: 'उच्च',
    statusLow: 'कम',
    statusNormal: 'सामान्य'
  },
  mr: {
    title: 'तपासणी अहवाल सोप्या भाषेत',
    step1: 'मूल्ये पडताळा',
    step2: 'सोप्या भाषेतील स्पष्टीकरण',
    verifyAlertTitle: 'तपासलेली मूल्ये पडताळा',
    verifyAlertDesc: 'कृपया अहवालातून काढलेली मूल्ये तपासा. आपण खालील मूल्ये किंवा संदर्भ कक्षा संपादित करू शकता.',
    testName: 'तपासणीचे नाव',
    result: 'निष्कर्ष',
    normalRange: 'सामान्य कक्षा',
    status: 'स्थिती',
    action: 'कृती',
    addTest: 'नवीन घटक जोडा',
    totalVerified: (n) => `एकूण: ${n} चाचण्या पडताळल्या`,
    confirmAndExplain: 'पडताळा आणि सोप्या भाषेत स्पष्टीकरण मिळवा',
    generating: 'स्पष्टीकरण तयार होत आहे...',
    extracting: 'अहवालातील घटक काढले जात आहेत...',
    currentLang: 'भाषा:',
    keyHighlights: 'महत्त्वाचे निष्कर्ष',
    explanationTitle: 'सोप्या भाषेतील सारांश',
    verifiedParams: 'तपासलेली मूल्ये',
    listenVoice: 'मराठीत ऐका',
    stopVoice: 'आवाज थांबवा',
    disclaimerHeader: 'अनिवार्य वैद्यकीय सूचना',
    disclaimer: 'हे तुमच्या रिपोर्टचे सोप्या शब्दांत स्पष्टीकरण देते. हे कोणतेही वैद्यकीय निदान नाही. कृपया आपल्या डॉक्टरांचा सल्ला घ्या. (This explains your report in simple words. It is not a diagnosis. Please consult your doctor.)',
    backToStep1: '← दुरुस्त करा',
    doneClose: 'पूर्ण झाले / बंद करा',
    statusHigh: 'जास्त',
    statusLow: 'कमी',
    statusNormal: 'सामान्य'
  }
};

export default function ExplainModal({ record, onClose }) {
  const { language } = useAuth();

  const [selectedLang, setSelectedLang] = useState(language || 'en');
  const [step, setStep] = useState(1); // 1: Verify Extracted Values, 2: Plain-Language Explanation
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [extractedValues, setExtractedValues] = useState([]);
  const [explanationData, setExplanationData] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const txt = UI_TEXT[selectedLang] || UI_TEXT.en;

  // Compute status flag based on value and reference range
  const calculateFlag = (testName, val, refRange) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'normal';

    const lowerName = (testName || '').toLowerCase();
    if (lowerName.includes('hba1c')) {
      if (num > 5.6) return 'high';
      return 'normal';
    }
    if (lowerName.includes('sugar') || lowerName.includes('glucose')) {
      if (num > 125) return 'high';
      if (num < 70) return 'low';
      return 'normal';
    }
    if (lowerName.includes('hemoglobin') || lowerName.includes('hb')) {
      if (num < 12.0) return 'low';
      if (num > 16.5) return 'high';
      return 'normal';
    }
    if (lowerName.includes('creatinine')) {
      if (num > 1.2) return 'high';
      if (num < 0.5) return 'low';
      return 'normal';
    }
    if (lowerName.includes('cholesterol')) {
      if (num > 200) return 'high';
      return 'normal';
    }

    if (refRange && refRange.includes('-')) {
      const parts = refRange.split('-').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        if (num < parts[0]) return 'low';
        if (num > parts[1]) return 'high';
        return 'normal';
      }
    }

    return 'normal';
  };

  // Step 1: Load extracted values for this report
  useEffect(() => {
    async function loadValues() {
      setLoading(true);
      try {
        const res = await api.extractReportValues(record.id);
        const values = (res.extractedValues || []).map(v => ({
          ...v,
          flag: v.flag || calculateFlag(v.test_name, v.value, v.reference_range)
        }));
        setExtractedValues(values);
      } catch (err) {
        console.error('Failed to extract values:', err);
      } finally {
        setLoading(false);
      }
    }
    loadValues();
  }, [record.id]);

  // Handle user manual editing on verification screen
  const handleValueChange = (index, field, newVal) => {
    const updated = [...extractedValues];
    updated[index][field] = newVal;
    if (field === 'value' || field === 'reference_range' || field === 'test_name') {
      updated[index].flag = calculateFlag(updated[index].test_name, updated[index].value, updated[index].reference_range);
    }
    setExtractedValues(updated);
  };

  // Add new test parameter row
  const handleAddTest = () => {
    setExtractedValues([
      ...extractedValues,
      {
        id: `custom-${Date.now()}`,
        test_name: 'Blood Pressure',
        value: '130/85',
        unit: 'mmHg',
        reference_range: '< 120/80',
        flag: 'high'
      }
    ]);
  };

  // Remove test parameter row
  const handleDeleteRow = (index) => {
    setExtractedValues(extractedValues.filter((_, i) => i !== index));
  };

  // Step 2: Confirm verified values and generate plain-language explanation
  const handleGenerateExplanation = async (targetLang = selectedLang) => {
    setExplaining(true);
    try {
      const res = await api.explainReport({
        recordId: record.id,
        verifiedValues: extractedValues,
        language: targetLang
      });
      setExplanationData(res);
      setStep(2);
    } catch (err) {
      console.error('Failed to explain report:', err);
      alert('Failed to generate explanation. Please try again.');
    } finally {
      setExplaining(false);
    }
  };

  // Switch explanation language dynamically
  const handleSwitchLanguage = async (newLang) => {
    setSelectedLang(newLang);
    if (step === 2) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      await handleGenerateExplanation(newLang);
    }
  };

  // Speech synthesis read aloud
  const handleToggleSpeech = () => {
    if (!window.speechSynthesis || !explanationData) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${explanationData.explanation}. ${explanationData.disclaimer}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.88;
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

  const languagesList = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' }
  ];

  const getStatusBadge = (flag) => {
    if (flag === 'high') {
      return {
        icon: '🔺',
        label: txt.statusHigh,
        className: 'bg-red-100 text-red-700 border-red-300'
      };
    }
    if (flag === 'low') {
      return {
        icon: '🔻',
        label: txt.statusLow,
        className: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }
    return {
      icon: '✓',
      label: txt.statusNormal,
      className: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Top Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-5 flex items-center justify-between border-b border-teal-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner border border-white/20">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">{txt.title}</h2>
              </div>
              <p className="text-xs text-teal-100 font-medium">
                {record.hospital} • {record.date} • {record.doctor || 'Pathology Panel'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector Pills */}
            <div className="bg-white/10 p-1 rounded-xl flex items-center space-x-1 border border-white/15">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSwitchLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    selectedLang === lang.code
                      ? 'bg-white text-teal-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition tap-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center space-x-1.5 transition ${step === 1 ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                1
              </span>
              <span>{txt.step1}</span>
            </button>

            <span className="text-slate-300">→</span>

            <span className={`flex items-center space-x-1.5 ${step === 2 ? 'text-teal-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </span>
              <span>{txt.step2}</span>
            </span>
          </div>

          {explanationData?.source && (
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              Engine: {explanationData.source.startsWith('llm') ? '🤖 Live LLM' : '⚡ Smriti Verified Model'}
            </span>
          )}
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
              <p className="text-xs sm:text-sm font-semibold">{txt.extracting}</p>
            </div>
          ) : step === 1 ? (
            /* ============================================================ */
            /* STEP 1: VERIFICATION SCREEN                                  */
            /* ============================================================ */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Alert prompt */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start space-x-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm">{txt.verifyAlertTitle}</h4>
                  <p className="text-amber-800 leading-relaxed">
                    {txt.verifyAlertDesc}
                  </p>
                </div>
              </div>

              {/* Table of extracted values */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">{txt.testName}</th>
                        <th className="p-3.5">{txt.result}</th>
                        <th className="p-3.5 hidden sm:table-cell">{txt.normalRange}</th>
                        <th className="p-3.5">{txt.status}</th>
                        <th className="p-3.5 text-center">{txt.action}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {extractedValues.map((val, idx) => {
                        const badge = getStatusBadge(val.flag);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition">
                            {/* Test Name */}
                            <td className="p-3">
                              <input
                                type="text"
                                value={val.test_name}
                                onChange={(e) => handleValueChange(idx, 'test_name', e.target.value)}
                                className="w-full bg-transparent font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-teal-500 rounded px-1.5 py-0.5 border border-transparent focus:border-slate-300"
                              />
                            </td>

                            {/* Value & Unit */}
                            <td className="p-3">
                              <div className="flex items-center space-x-1.5">
                                <input 
                                  type="text"
                                  value={val.value}
                                  onChange={(e) => handleValueChange(idx, 'value', e.target.value)}
                                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
                                />
                                <span className="text-xs text-slate-500 font-semibold">{val.unit}</span>
                              </div>
                            </td>

                            {/* Reference Range */}
                            <td className="p-3 text-slate-600 hidden sm:table-cell">
                              <input
                                type="text"
                                value={val.reference_range}
                                onChange={(e) => handleValueChange(idx, 'reference_range', e.target.value)}
                                className="w-24 bg-transparent text-slate-600 focus:bg-white focus:ring-1 focus:ring-teal-500 rounded px-1.5 py-0.5 border border-transparent focus:border-slate-300"
                              />
                            </td>

                            {/* Status with Color AND Icon/Text (Single translated label) */}
                            <td className="p-3">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black border shadow-xs ${badge.className}`}>
                                <span>{badge.icon}</span>
                                <span>{badge.label}</span>
                              </span>
                            </td>

                            {/* Delete row */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(idx)}
                                title="Remove parameter"
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add parameter button */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={handleAddTest}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-teal-600" />
                    <span>+ {txt.addTest}</span>
                  </button>
                  <span className="text-slate-400 font-medium">{txt.totalVerified(extractedValues.length)}</span>
                </div>
              </div>

              {/* Action button */}
              <button
                type="button"
                disabled={explaining || extractedValues.length === 0}
                onClick={() => handleGenerateExplanation(selectedLang)}
                className="w-full py-4 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center space-x-2 tap-target disabled:opacity-50 text-sm sm:text-base"
              >
                {explaining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{txt.generating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-teal-200" />
                    <span>{txt.confirmAndExplain}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ============================================================ */
            /* STEP 2: PLAIN-LANGUAGE EXPLANATION                           */
            /* ============================================================ */
            <div className="space-y-6 animate-fadeIn">
              
              {/* Language and Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center space-x-2 text-slate-700 font-bold">
                  <Languages className="w-4 h-4 text-teal-600" />
                  <span>{txt.currentLang}</span>
                  <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full font-black">
                    {selectedLang === 'mr' ? 'मराठी (Marathi)' : selectedLang === 'hi' ? 'हिंदी (Hindi)' : 'English'}
                  </span>
                </div>

                <div className="flex space-x-1.5">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSwitchLanguage(lang.code)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        selectedLang === lang.code
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lang.native}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Highlights Bullet Cards (Color coded) */}
              {explanationData?.keyHighlights && explanationData.keyHighlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {txt.keyHighlights}
                  </h4>
                  <div className="space-y-2">
                    {explanationData.keyHighlights.map((hl, i) => (
                      <div 
                        key={i} 
                        className={`text-xs sm:text-sm font-bold p-3.5 rounded-2xl border flex items-start space-x-2.5 shadow-xs ${
                          hl.includes('🔺') || hl.includes('जास्त') || hl.includes('उच्च') || hl.includes('Elevated')
                            ? 'bg-red-50/70 border-red-200 text-red-950'
                            : hl.includes('🔻') || hl.includes('कमी') || hl.includes('कम') || hl.includes('Low')
                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 mt-1.5"></span>
                        <span className="leading-relaxed">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Plain-Language Explanation Card */}
              <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-slate-50 border-2 border-teal-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-teal-900 font-extrabold text-sm">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>{txt.explanationTitle}</span>
                </div>
                <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium">
                  {explanationData?.explanation}
                </p>
              </div>

              {/* MANDATORY MEDICAL DISCLAIMER: ALWAYS DISPLAYED RIGHT BELOW THE EXPLANATION */}
              <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 sm:p-5 text-xs text-red-950 flex items-start space-x-3.5 shadow-sm">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black text-red-800 block uppercase tracking-wider text-[10px]">
                    {txt.disclaimerHeader}
                  </span>
                  <p className="font-bold text-xs sm:text-sm leading-relaxed text-red-950">
                    "{selectedLang === 'en' 
                      ? "This explains your report in simple words. It is not a diagnosis. Please consult your doctor." 
                      : (explanationData?.disclaimer || txt.disclaimer)}"
                  </p>
                </div>
              </div>

              {/* Verified Values Overview Strip with Single Translated Status */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  {txt.verifiedParams}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(explanationData?.verifiedValues || extractedValues).map((v, i) => {
                    const badge = getStatusBadge(v.flag);
                    return (
                      <div 
                        key={i} 
                        className={`p-3 rounded-2xl border shadow-xs space-y-1 ${
                          v.flag === 'high' 
                            ? 'bg-red-50/80 border-red-200 text-red-950' 
                            : v.flag === 'low' 
                            ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
                            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        }`}
                      >
                        <span className="text-[11px] font-bold block truncate">{v.test_name}</span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-base font-black">{v.value}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{v.unit}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center space-x-1 border ${badge.className}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audio Read Aloud Button */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`w-full py-3.5 px-4 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold text-sm transition tap-target ${
                  isSpeaking 
                    ? 'bg-red-50 text-red-700 border-red-300 shadow-sm' 
                    : 'bg-white hover:bg-teal-50 text-teal-900 border-teal-300 shadow-sm'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5 text-red-600 animate-pulse" />
                    <span>{txt.stopVoice}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-teal-600" />
                    <span>{txt.listenVoice}</span>
                  </>
                )}
              </button>

              {/* Bottom Navigation Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/2 py-3 px-4 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center space-x-1.5 transition tap-target"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{txt.backToStep1}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition shadow-md tap-target"
                >
                  {txt.doneClose}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
