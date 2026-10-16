import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import RecordCard from './RecordCard';
import FilePreviewModal from './FilePreviewModal';
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  Calendar, 
  Building2, 
  Clock, 
  PlusCircle, 
  Activity, 
  Pill, 
  Scan, 
  Syringe, 
  FileText,
  Loader2,
  X,
  Trash2
} from 'lucide-react';

export default function TimelineView({ onExplain, onShare, onNavigateUpload }) {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalRecords: 0, totalHospitals: 0, yearsSpanned: 1 });
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewRecord, setPreviewRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filterChips = [
    { id: 'all', label: t('timeline.filterAll'), icon: Filter },
    { id: 'lab', label: t('timeline.filterReports'), icon: Activity },
    { id: 'prescription', label: t('timeline.filterPrescriptions'), icon: Pill },
    { id: 'scan', label: t('timeline.filterScans'), icon: Scan },
    { id: 'vaccination', label: t('timeline.filterVaccinations'), icon: Syringe },
    { id: 'visit', label: t('timeline.filterVisits'), icon: FileText }
  ];

  const hospitalOptions = [
    { id: 'all', label: t('timeline.filterAllHospitals') },
    { id: 'Lilavati', label: 'Lilavati Hospital, Bandra' },
    { id: 'K.E.M.', label: 'K.E.M. Hospital, Parel' },
    { id: 'Ruby Hall', label: 'Ruby Hall Clinic, Pune' }
  ];

  const timeRangeOptions = [
    { id: 'all', label: t('timeline.dateRangeAll') },
    { id: '6m', label: t('timeline.dateRange6m') },
    { id: '1y', label: t('timeline.dateRange1y') },
    { id: '2y', label: t('timeline.dateRange2y') }
  ];

  useEffect(() => {
    fetchRecords();
  }, [sortOrder, categoryFilter, hospitalFilter, timeRangeFilter, searchQuery]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await api.getRecords({
        sort: sortOrder,
        category: categoryFilter,
        hospital: hospitalFilter,
        timeRange: timeRangeFilter,
        search: searchQuery
      });
      setRecords(res.records || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to fetch timeline records:', err);
    } finally {
      setLoading(false);
    }
  }

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await api.deleteRecord(recordToDelete.id);

      // Instantaneous UI update: remove record from list and decrease count immediately
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      setStats(prev => ({
        ...prev,
        totalRecords: Math.max(0, prev.totalRecords - 1)
      }));

      setRecordToDelete(null);

      // Background re-fetch to keep counts and date ranges consistent
      fetchRecords();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setHospitalFilter('all');
    setTimeRangeFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = categoryFilter !== 'all' || hospitalFilter !== 'all' || timeRangeFilter !== 'all' || searchQuery !== '';

  // Group records by Year and Month for sticky timeline headers
  const groupedRecords = records.reduce((acc, rec) => {
    const d = new Date(rec.date);
    const yearMonth = isNaN(d) 
      ? rec.date.slice(0, 7) 
      : d.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(rec);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Summary Strip (PRD 7.4) */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-400/30">
            <Clock className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest block">
              {t('timeline.title')}
            </span>
            <h2 className="text-lg sm:text-xl font-black">
              {t('dashboard.summaryStrip', {
                count: stats.totalRecords,
                hospitals: stats.totalHospitals,
                years: stats.yearsSpanned
              })}
            </h2>
          </div>
        </div>

        <button
          onClick={onNavigateUpload}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md transition self-stretch sm:self-auto justify-center tap-target"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('nav.upload')}</span>
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Search Input & Sort Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('timeline.searchPlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 w-full sm:w-auto justify-center transition tap-target"
          >
            <ArrowUpDown className="w-4 h-4 text-teal-600" />
            <span>{sortOrder === 'desc' ? t('timeline.sortNewest') : t('timeline.sortOldest')}</span>
          </button>
        </div>

        {/* Secondary Filters: Hospital Selector + Date Range Selector (PRD 7.4) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-slate-100">
          
          {/* Hospital Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-1/2">
            <Building2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <select
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {hospitalOptions.map((h) => (
                <option key={h.id} value={h.id}>{h.label}</option>
              ))}
            </select>
          </div>

          {/* Date-Range Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-1/2">
            <Calendar className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <select
              value={timeRangeFilter}
              onChange={(e) => setTimeRangeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {timeRangeOptions.map((tr) => (
                <option key={tr.id} value={tr.id}>{tr.label}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                title="Clear all filters"
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Filter Chips (PRD 7.4) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {filterChips.map((chip) => {
            const Icon = chip.icon;
            const isActive = categoryFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setCategoryFilter(chip.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition tap-target ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-xs font-medium">इतिहास लोड होत आहे...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{t('timeline.emptyTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{t('timeline.emptyDesc')}</p>
          <button
            onClick={onNavigateUpload}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-teal-600/20 tap-target"
          >
            {t('nav.upload')}
          </button>
        </div>
      ) : (
        <div className="relative border-l-2 border-teal-200 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-8">
          {Object.entries(groupedRecords).map(([monthYear, items]) => (
            <div key={monthYear} className="space-y-4">
              
              {/* Sticky Month-Year Milestone Header (PRD 7.4) */}
              <div className="sticky top-16 z-20 -ml-8 sm:-ml-10 flex items-center space-x-3 mb-2 py-1">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-white">
                  📅
                </div>
                <span className="px-3.5 py-1 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full text-xs font-black text-slate-800 shadow-sm">
                  {monthYear}
                </span>
              </div>

              {/* Record Cards in this Group */}
              <div className="space-y-4">
                {items.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    onExplain={onExplain}
                    onShare={onShare}
                    onPreviewFile={(rec) => setPreviewRecord(rec)}
                    onDelete={(rec) => setRecordToDelete(rec)}
                  />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Protected Original File Preview Modal */}
      {previewRecord && (
        <FilePreviewModal
          record={previewRecord}
          onClose={() => setPreviewRecord(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-2 border-red-300 animate-scaleUp space-y-4">
            
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Delete this record?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete this record? This will permanently remove the record, its uploaded file, and any linked test data or derived medicines from your timeline.
              </p>
            </div>

            {/* Record Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-slate-500">Hospital:</span>
                <span className="font-bold truncate max-w-[220px]">{recordToDelete.hospital}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-slate-500">Date:</span>
                <span className="font-bold">{recordToDelete.date}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-slate-500">Category:</span>
                <span className="font-bold">{recordToDelete.category}</span>
              </div>
              {recordToDelete.doctor && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-500">Doctor:</span>
                  <span className="font-bold truncate max-w-[220px]">{recordToDelete.doctor}</span>
                </div>
              )}
              {recordToDelete.file_name && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-500">Attached File:</span>
                  <span className="font-mono text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 truncate max-w-[180px]">
                    {recordToDelete.file_name}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setRecordToDelete(null)}
                className="w-1/2 py-3 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs transition tap-target"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteRecord}
                className="w-1/2 py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center space-x-1.5 tap-target"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
