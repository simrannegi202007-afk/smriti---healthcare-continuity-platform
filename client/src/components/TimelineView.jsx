import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import RecordCard from './RecordCard';
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
  Loader2
} from 'lucide-react';

export default function TimelineView({ onExplain, onShare, onNavigateUpload }) {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalRecords: 0, totalHospitals: 0, yearsSpanned: 1 });
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterChips = [
    { id: 'all', label: t('timeline.filterAll'), icon: Filter },
    { id: 'lab', label: t('timeline.filterReports'), icon: Activity },
    { id: 'prescription', label: t('timeline.filterPrescriptions'), icon: Pill },
    { id: 'scan', label: t('timeline.filterScans'), icon: Scan },
    { id: 'vaccination', label: t('timeline.filterVaccinations'), icon: Syringe },
    { id: 'visit', label: t('timeline.filterVisits'), icon: FileText }
  ];

  useEffect(() => {
    fetchRecords();
  }, [sortOrder, categoryFilter, searchQuery]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await api.getRecords({
        sort: sortOrder,
        category: categoryFilter,
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
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4">
        
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
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 w-full sm:w-auto justify-center transition"
          >
            <ArrowUpDown className="w-4 h-4 text-teal-600" />
            <span>{sortOrder === 'desc' ? t('timeline.sortNewest') : t('timeline.sortOldest')}</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterChips.map((chip) => {
            const Icon = chip.icon;
            const isActive = categoryFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setCategoryFilter(chip.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
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
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-teal-600/20"
          >
            {t('nav.upload')}
          </button>
        </div>
      ) : (
        <div className="relative border-l-2 border-teal-200 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-8">
          {Object.entries(groupedRecords).map(([monthYear, items]) => (
            <div key={monthYear} className="space-y-4">
              
              {/* Sticky Month-Year Milestone Header */}
              <div className="sticky top-20 z-10 -ml-8 sm:-ml-10 flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-white">
                  📅
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-black text-slate-800 shadow-sm">
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
                  />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
