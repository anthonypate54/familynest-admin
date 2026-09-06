import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import { Megaphone, Play, List, Mail, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface Segment {
  id: number;
  name: string;
  description: string | null;
  sql_text: string;
  is_active: boolean;
  updated_at: string;
}

interface PreviewResult {
  rows: Record<string, any>[];
  rowCount: number;
  truncated: boolean;
}

interface Audience {
  id: string;
  name: string;
  memberCount?: number;
}

interface MailchimpStatus {
  connected: boolean;
  accountName?: string;
  email?: string;
  message?: string;
}

interface SyncResult {
  syncedCount: number;
  failedCount: number;
  loggedCount: number;
  failures: Array<{ row: any; reason: string }>;
}

const MarketingExport: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [sqlText, setSqlText] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Row selection in the preview table, so an admin can exclude specific
  // rows (e.g. a known test account) from a batch before syncing - this
  // only ever filters the in-memory preview array, it never touches the
  // database or Mailchimp.
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Mailchimp connection test
  const [mcStatus, setMcStatus] = useState<MailchimpStatus | null>(null);
  const [mcChecking, setMcChecking] = useState(false);
  const [audiences, setAudiences] = useState<Audience[] | null>(null);
  const [audiencesLoading, setAudiencesLoading] = useState(false);

  // Sync to Mailchimp
  const [campaignName, setCampaignName] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCheckMailchimp = async () => {
    setMcChecking(true);
    setMcStatus(null);
    setAudiences(null);
    try {
      const response = await api.get('/marketing/mailchimp/status');
      setMcStatus(response.data);
    } catch (err: any) {
      setMcStatus({
        connected: false,
        message: err?.response?.data?.message || 'Failed to reach the backend'
      });
    } finally {
      setMcChecking(false);
    }
  };

  const handleListAudiences = async () => {
    setAudiencesLoading(true);
    try {
      const response = await api.get('/marketing/mailchimp/audiences');
      setAudiences(response.data.audiences);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to list Mailchimp audiences');
    } finally {
      setAudiencesLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      setSegmentsLoading(true);
      const response = await api.get('/marketing/segments');
      setSegments(response.data.segments);
    } catch (err) {
      console.error('Failed to fetch segments:', err);
    } finally {
      setSegmentsLoading(false);
    }
  };

  const handleSelectSegment = (name: string) => {
    setSelectedSegment(name);
    const segment = segments.find(s => s.name === name);
    if (segment) {
      setSqlText(segment.sql_text);
    }
  };

  const handleRunPreview = async () => {
    setError(null);
    setResult(null);
    setSelectedRows(new Set());

    if (!sqlText.trim()) {
      setError('Enter a query or pick a saved segment first');
      return;
    }

    try {
      setRunning(true);
      const response = await api.post('/marketing/preview', { sql: sqlText, limit: 200 });
      setResult(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to run query');
    } finally {
      setRunning(false);
    }
  };

  const toggleRowSelected = (index: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!result) return;
    setSelectedRows(prev =>
      prev.size === result.rows.length ? new Set() : new Set(result.rows.map((_, i) => i))
    );
  };

  const handleRemoveSelected = () => {
    if (!result || selectedRows.size === 0) return;
    const remainingRows = result.rows.filter((_, i) => !selectedRows.has(i));
    setResult({
      ...result,
      rows: remainingRows,
      rowCount: remainingRows.length
    });
    setSelectedRows(new Set());
  };

  useEffect(() => {
    if (audiences && audiences.length === 1 && !selectedListId) {
      setSelectedListId(audiences[0].id);
    }
  }, [audiences, selectedListId]);

  const handleSync = async () => {
    setSyncError(null);
    setSyncResult(null);

    if (!campaignName.trim()) {
      setSyncError('Enter a campaign name');
      return;
    }
    if (!selectedListId) {
      setSyncError('Pick a Mailchimp audience (click "List my audiences" above first)');
      return;
    }
    if (!result || result.rows.length === 0) {
      setSyncError('Run a preview with results first');
      return;
    }

    try {
      setSyncing(true);
      const response = await api.post('/marketing/sync', {
        campaignName: campaignName.trim(),
        segment: selectedSegment || 'ad-hoc',
        listId: selectedListId,
        rows: result.rows
      });
      setSyncResult(response.data);
    } catch (err: any) {
      setSyncError(err?.response?.data?.message || 'Failed to sync to Mailchimp');
    } finally {
      setSyncing(false);
    }
  };

  const columns = result && result.rows.length > 0 ? Object.keys(result.rows[0]) : [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="flex items-center">
        <Megaphone className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-900">Marketing</h2>
      </div>

      {/* Mailchimp connection test - temporary until sync UI is built */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Mailchimp Connection</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckMailchimp}
            disabled={mcChecking}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {mcChecking ? 'Checking...' : 'Test Connection'}
          </button>

          {mcStatus && (
            <span className={`flex items-center gap-1 text-sm ${mcStatus.connected ? 'text-green-700' : 'text-red-700'}`}>
              {mcStatus.connected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {mcStatus.connected
                ? `Connected as ${mcStatus.accountName} (${mcStatus.email})`
                : mcStatus.message}
            </span>
          )}
        </div>

        {mcStatus?.connected && (
          <div className="mt-4">
            <button
              onClick={handleListAudiences}
              disabled={audiencesLoading}
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              {audiencesLoading ? 'Loading audiences...' : 'List my audiences'}
            </button>

            {audiences && (
              <ul className="mt-3 space-y-1">
                {audiences.map((a) => (
                  <li key={a.id} className="text-sm text-gray-700">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-gray-400"> — id: {a.id}{a.memberCount !== undefined ? `, ${a.memberCount} members` : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved segments */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <div className="flex items-center mb-4">
            <List className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Saved Segments</h3>
          </div>

          {segmentsLoading ? (
            <div className="flex items-center justify-center h-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : segments.length === 0 ? (
            <p className="text-sm text-gray-500">No saved segments yet</p>
          ) : (
            <div className="space-y-2">
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => handleSelectSegment(segment.name)}
                  className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                    selectedSegment === segment.name
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                  {segment.description && (
                    <div className="text-xs text-gray-500 mt-1">{segment.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Query editor + results */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Query</h3>

          <textarea
            value={sqlText}
            onChange={(e) => setSqlText(e.target.value)}
            rows={8}
            placeholder="SELECT id, email FROM app_user WHERE subscription_status = 'active'"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Read-only SELECT/WITH queries only, capped at 200 rows for preview.
            </p>
            <button
              onClick={handleRunPreview}
              disabled={running}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {running ? 'Running...' : 'Run Preview'}
            </button>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded text-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  {result.rowCount} row{result.rowCount === 1 ? '' : 's'}
                  {result.truncated ? ' (truncated to preview limit)' : ''}
                </p>
                {result.rows.length > 0 && (
                  <button
                    onClick={handleRemoveSelected}
                    disabled={selectedRows.size === 0}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Selected{selectedRows.size > 0 ? ` (${selectedRows.size})` : ''}
                  </button>
                )}
              </div>
              {result.rows.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No rows returned</p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-md max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-8">
                          <input
                            type="checkbox"
                            checked={selectedRows.size === result.rows.length}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        {columns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.rows.map((row, i) => (
                        <tr key={i} className={selectedRows.has(i) ? 'bg-red-50' : undefined}>
                          <td className="px-3 py-2 w-8">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(i)}
                              onChange={() => toggleRowSelected(i)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          {columns.map((col) => (
                            <td key={col} className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                              {row[col] === null ? <span className="text-gray-400">null</span> : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result.rows.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sync to Mailchimp</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Campaign name</label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g. Sept 2026 - Active Users"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Audience</label>
                      <select
                        value={selectedListId}
                        onChange={(e) => setSelectedListId(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">
                          {audiences ? 'Select an audience...' : 'Click "List my audiences" above first'}
                        </option>
                        {audiences?.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4" />
                    {syncing ? 'Syncing...' : `Sync ${result.rows.length} Contact${result.rows.length === 1 ? '' : 's'} to Mailchimp`}
                  </button>

                  {syncError && (
                    <div className="mt-3 px-4 py-3 rounded text-sm bg-red-50 border border-red-200 text-red-700">
                      {syncError}
                    </div>
                  )}

                  {syncResult && (
                    <div className="mt-3 px-4 py-3 rounded text-sm bg-green-50 border border-green-200 text-green-700">
                      Synced {syncResult.syncedCount} contact{syncResult.syncedCount === 1 ? '' : 's'} to Mailchimp
                      and logged {syncResult.loggedCount} row{syncResult.loggedCount === 1 ? '' : 's'} to the export history.
                      {syncResult.failedCount > 0 && (
                        <div className="mt-2 text-red-700">
                          {syncResult.failedCount} failed:
                          <ul className="list-disc ml-5">
                            {syncResult.failures.slice(0, 10).map((f, i) => (
                              <li key={i}>{f.row?.email || 'unknown'}: {f.reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingExport;
