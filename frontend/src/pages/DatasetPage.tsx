import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Download, 
  Database, 
  FileText, 
  Calendar, 
  AlertCircle
} from 'lucide-react';
import { uploadDataset } from '../services/api';

export const DatasetPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    uploadDataset(file)
      .then((res) => {
        setUploadResult(res);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Dataset upload and parsing failed.');
      })
      .finally(() => setUploading(false));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            VOLTA Dataset Management & Quality Audit
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload custom smart-meter consumption datasets (CSV / Excel), inspect data quality, and audit schema consistency.
          </p>
        </div>

        {/* Download Sample Dataset Button */}
        <a
          href="/api/dataset/sample"
          download="volta_sample_electricity_data.csv"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow-md transition-all focus:outline-none"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          Download Sample CSV Template
        </a>
      </div>

      {/* Current Active Dataset Status */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-emerald-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">
              Active Simulation Dataset: 30-Day Multi-Consumer Smart Meter Telemetry
            </div>
            <div className="text-emerald-400/90">
              25 consumers (12 Residential, 6 Commercial, 4 Industrial, 3 Institutional) • 18,000 hourly readings loaded.
            </div>
          </div>
        </div>

        <span className="font-mono text-[11px] bg-emerald-900/80 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-700">
          Status: Ready for Inference
        </span>
      </div>

      {/* Upload Box */}
      <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-cyan-400" />
          Upload New Electricity Consumption Dataset
        </div>

        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 text-center bg-slate-900/60 hover:bg-cyan-950/20 transition-all flex flex-col items-center justify-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-500 mb-3" />
          <p className="text-sm font-semibold text-slate-200 mb-1">
            {file ? file.name : 'Select or drag and drop your dataset file'}
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Supported formats: <strong>.csv</strong>, <strong>.xlsx</strong>, or <strong>.xls</strong> (Up to 50MB)
          </p>

          <input
            type="file"
            id="dataset-upload-input"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <label
              htmlFor="dataset-upload-input"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-all"
            >
              Choose File
            </label>

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none flex items-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validating Schema...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Run Data Audit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Dataset Audit Report (Shown after upload) */}
      {uploadResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quality Score Banner */}
          <div className="bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-md ${
                uploadResult.quality_report.grade_color === 'green' ? 'bg-emerald-600' :
                uploadResult.quality_report.grade_color === 'blue' ? 'bg-cyan-600' :
                uploadResult.quality_report.grade_color === 'orange' ? 'bg-amber-600' : 'bg-rose-600'
              }`}>
                <span className="text-xl leading-none">{uploadResult.quality_report.score}</span>
                <span className="text-[9px] uppercase tracking-wider">/ 100</span>
              </div>
              <div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>Data Quality: {uploadResult.quality_report.grade}</span>
                  {uploadResult.is_valid && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Schema Validated
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {uploadResult.quality_report.recommendation}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-700 font-mono">
              File: <strong className="text-cyan-400">{uploadResult.filename}</strong>
            </div>
          </div>

          {/* Key Dataset Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="text-xs text-slate-400 mb-1">Total Rows</div>
              <div className="text-2xl font-bold text-white font-mono">
                {uploadResult.total_rows.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Data records parsed</div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="text-xs text-slate-400 mb-1">Distinct Consumers</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {uploadResult.total_consumers}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Unique consumer IDs</div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="text-xs text-slate-400 mb-1">Missing Values</div>
              <div className={`text-2xl font-bold font-mono ${uploadResult.missing_values.total_missing > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {uploadResult.missing_values.total_missing}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Null / NaN cells detected</div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="text-xs text-slate-400 mb-1">Duplicate Timestamps</div>
              <div className={`text-2xl font-bold font-mono ${uploadResult.duplicate_timestamps > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {uploadResult.duplicate_timestamps}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Per-consumer conflicts</div>
            </div>
          </div>

          {/* Date Range & Detected Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Temporal Date Range
              </div>
              <div className="text-xs text-slate-300 font-mono bg-slate-900/90 p-2.5 rounded-xl border border-slate-700">
                From: <strong>{uploadResult.date_range.start}</strong><br />
                To:&nbsp;&nbsp;&nbsp;<strong>{uploadResult.date_range.end}</strong>
              </div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Detected Columns
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uploadResult.detected_columns.map((col: string) => (
                  <span key={col} className="px-2.5 py-1 bg-slate-900 text-cyan-300 text-[11px] font-mono rounded-lg border border-slate-700">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-[#131d33] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Dataset Preview (First 10 Rows)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-sans">
                  <tr>
                    {uploadResult.detected_columns.map((col: string) => (
                      <th key={col} className="py-2.5 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {uploadResult.preview.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      {uploadResult.detected_columns.map((col: string) => (
                        <td key={col} className="py-2 px-3 text-slate-300">
                          {row[col] !== null ? String(row[col]) : <span className="text-rose-400 font-bold">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
