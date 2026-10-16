import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  AlertCircle,
  Building2,
  Calendar,
  User,
  Hash
} from 'lucide-react';

export default function FilePreviewModal({ record, shareToken = null, onClose }) {
  const { t } = useTranslation();
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileName = record?.file_name || 'medical_document.pdf';
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(fileName);

  useEffect(() => {
    let activeUrl = null;
    let isMounted = true;

    async function loadProtectedFile() {
      if (!record?.id) return;
      setLoading(true);
      setError(null);

      try {
        const url = await api.getProtectedFileBlobUrl(record.id, shareToken);
        if (isMounted) {
          activeUrl = url;
          setBlobUrl(url);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load protected file:', err);
          setError(err.message || 'Unable to access protected file. Session may have expired or access is restricted.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProtectedFile();

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [record?.id, shareToken]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Header Strip */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold truncate max-w-xs sm:max-w-md">{record.hospital}</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-400/30 flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Protected Access</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2">
                <span>{record.date}</span>
                <span>•</span>
                <span>{record.category}</span>
                {record.doctor && (
                  <>
                    <span>•</span>
                    <span>{record.doctor}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {blobUrl && (
              <a
                href={blobUrl}
                download={fileName}
                title="Download Document"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition tap-target"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-900/60 hover:text-red-300 text-slate-300 transition tap-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Integrity Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Encrypted Session • File is not publicly accessible (PRD Sec 7.3/9)</span>
          </div>

          {record.file_hash && (
            <div className="flex items-center space-x-1 text-[11px] font-mono bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-500 truncate max-w-xs">
              <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">SHA-256: {record.file_hash}</span>
            </div>
          )}
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 bg-slate-100 p-3 sm:p-6 overflow-auto flex items-center justify-center relative">
          {loading && (
            <div className="flex flex-col items-center space-y-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <span className="text-xs font-semibold">सुरक्षित दस्तऐवज उघडत आहे (Streaming protected file)...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 max-w-md text-center space-y-3 shadow-sm">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h4 className="font-bold text-red-950 text-sm">Protected File Access Restricted</h4>
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close Viewer
              </button>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <div className="w-full h-full flex items-center justify-center">
              {isPdf ? (
                <iframe
                  src={blobUrl}
                  title="Medical Document Preview"
                  className="w-full h-full rounded-2xl border border-slate-300 bg-white shadow-inner"
                />
              ) : isImage ? (
                <div className="max-w-full max-h-full overflow-auto flex items-center justify-center p-4 bg-white rounded-2xl border border-slate-300 shadow-sm">
                  <img
                    src={blobUrl}
                    alt={fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <FileText className="w-12 h-12 text-teal-600 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">{fileName}</p>
                  <p className="text-xs text-slate-500">Document ready for offline viewing or print</p>
                  <a
                    href={blobUrl}
                    download={fileName}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">
            फाईल: <strong>{fileName}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition tap-target"
          >
            बंद करा (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
