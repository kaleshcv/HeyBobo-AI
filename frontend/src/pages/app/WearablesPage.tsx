import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Chip, Button, IconButton,
  Avatar, LinearProgress, Switch, Tooltip, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, useTheme,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import BluetoothSearchingIcon from '@mui/icons-material/BluetoothSearching';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PeopleIcon from '@mui/icons-material/People';
import toast from 'react-hot-toast';
import { bleService } from '@/lib/bleService';
import {
  useWearablesStore,
  DEVICE_CATALOG,
  DEVICE_TYPE_META,
  METRIC_META,
  type WearableDevice,
  type DeviceCatalogEntry,
  type DeviceType,
  type HealthMetric,
  type StudentWearableProfile,
  type ConnectionStatus,
} from '@/store/wearablesStore';

// ─── Helpers ────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function batteryColor(level: number): string {
  if (level > 50) return '#4caf50';
  if (level > 20) return '#ff9800';
  return '#f44336';
}

function statusColor(status: ConnectionStatus): string {
  switch (status) {
    case 'connected': return '#4caf50';
    case 'syncing': return '#2196f3';
    case 'pairing': return '#ff9800';
    case 'disconnected': return '#9e9e9e';
    case 'error': return '#f44336';
  }
}

function severityColor(s: string): 'error' | 'warning' | 'info' {
  if (s === 'critical') return 'error';
  if (s === 'warning') return 'warning';
  return 'info';
}

// ─── Pair Device Dialog ─────────────────────────────────

function PairDeviceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const { pairDevice, pairRealDevice, devices } = useWearablesStore();
  const [mode, setMode] = useState<'bluetooth' | 'catalog'>('bluetooth');
  const [filter, setFilter] = useState<DeviceType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [pairedInfo, setPairedInfo] = useState<{ name: string; services: string[] } | null>(null);

  const bleSupported = bleService.isSupported();

  const alreadyPaired = new Set(devices.map((d) => d.brand));
  const alreadyPairedBLE = new Set(devices.filter((d) => d.bleDeviceId).map((d) => d.bleDeviceId));

  const filtered = DEVICE_CATALOG.filter((e) => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.model.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const types: (DeviceType | 'all')[] = ['all', 'smart-watch', 'smart-ring', 'fitness-band', 'smart-scale', 'blood-pressure', 'cgm', 'pulse-oximeter', 'phone-sensors'];

  const handlePair = (entry: DeviceCatalogEntry) => {
    pairDevice(entry);
    toast.success(`${entry.name} paired successfully!`);
    onClose();
  };

  const handleBluetoothScan = async (acceptAll = false) => {
    setScanning(true);
    setScanError(null);
    setPairedInfo(null);
    try {
      const info = acceptAll ? await bleService.scanAllDevices() : await bleService.scanAndPair();
      if (alreadyPairedBLE.has(info.deviceId)) {
        toast.error('This device is already paired');
        setScanning(false);
        return;
      }
      pairRealDevice(info);
      setPairedInfo({ name: info.name, services: info.discoveredServices });
      toast.success(`${info.name} connected via Bluetooth!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bluetooth scan failed';
      if (!msg.includes('cancelled') && !msg.includes('User cancelled')) {
        setScanError(msg);
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BluetoothIcon sx={{ color: '#1e88e5' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Pair a Device</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Mode tabs */}
        <Tabs
          value={mode === 'bluetooth' ? 0 : 1}
          onChange={(_, v) => { setMode(v === 0 ? 'bluetooth' : 'catalog'); setScanError(null); setPairedInfo(null); }}
          sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13 } }}
        >
          <Tab icon={<BluetoothSearchingIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Bluetooth (Real Device)" />
          <Tab icon={<AddIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Simulated Device" />
        </Tabs>

        {/* ── Bluetooth scan mode ── */}
        {mode === 'bluetooth' && (
          <Box>
            {!bleSupported ? (
              <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
                Web Bluetooth is not supported in this browser. Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Opera</strong> to pair real Bluetooth devices.
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  Pair your real Bluetooth Low Energy (BLE) health device — heart rate monitors, smart watches, fitness bands, scales, blood pressure monitors, and more. Make sure your device is turned on and in pairing mode.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={scanning ? <CircularProgress size={16} color="inherit" /> : <BluetoothSearchingIcon />}
                    onClick={() => handleBluetoothScan(false)}
                    disabled={scanning}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#1e88e5', flex: 1 }}
                  >
                    {scanning ? 'Scanning...' : 'Scan for Health Devices'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={scanning ? <CircularProgress size={16} /> : <SearchIcon />}
                    onClick={() => handleBluetoothScan(true)}
                    disabled={scanning}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, flex: 1 }}
                  >
                    {scanning ? 'Scanning...' : 'Scan All Nearby'}
                  </Button>
                </Box>

                {scanError && (
                  <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{scanError}</Alert>
                )}

                {pairedInfo && (
                  <Alert severity="success" icon={<BluetoothConnectedIcon />} sx={{ borderRadius: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{pairedInfo.name} paired successfully!</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Services: {pairedInfo.services.join(', ') || 'none detected'}
                    </Typography>
                  </Alert>
                )}

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Supported BLE Profiles</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {[
                      { label: '❤️ Heart Rate', desc: 'Real-time HR, HRV, calories' },
                      { label: '🩺 Blood Pressure', desc: 'Systolic / diastolic' },
                      { label: '🌡️ Thermometer', desc: 'Body temperature' },
                      { label: '⚖️ Weight Scale', desc: 'Weight readings' },
                      { label: '🔋 Battery', desc: 'Battery level' },
                      { label: '🏃 Running Speed', desc: 'Steps & distance' },
                      { label: '🚴 Cycling', desc: 'Speed & power' },
                    ].map((p) => (
                      <Tooltip key={p.label} title={p.desc}>
                        <Chip label={p.label} size="small" sx={{ fontSize: 11, fontWeight: 600 }} />
                      </Tooltip>
                    ))}
                  </Box>
                </Paper>

                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: 12 } }}>
                  <strong>Tip:</strong> For Apple Watch, Fitbit, Garmin, and Oura Ring, use the <strong>Simulated Device</strong> tab — these devices use proprietary protocols and don't expose standard BLE GATT services to web browsers. Direct BLE pairing works best with heart rate straps (Polar, Wahoo), smart scales, BP monitors, and generic fitness bands.
                </Alert>
              </>
            )}
          </Box>
        )}

        {/* ── Catalog mode (existing simulated devices) ── */}
        {mode === 'catalog' && (
          <>
            <TextField
              placeholder="Search devices..."
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ mb: 1.5, mt: 0.5 }}
            />

        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          {types.map((t) => {
            const meta = t === 'all' ? null : DEVICE_TYPE_META[t];
            return (
              <Chip
                key={t}
                label={t === 'all' ? 'All' : `${meta!.emoji} ${meta!.label}`}
                size="small"
                onClick={() => setFilter(t)}
                variant={filter === t ? 'filled' : 'outlined'}
                sx={{ fontSize: 11, fontWeight: filter === t ? 600 : 400, bgcolor: filter === t ? (dk ? 'rgba(255,255,255,0.12)' : '#e0e0e0') : undefined }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
          {filtered.map((entry) => {
            const paired = alreadyPaired.has(entry.brand);
            return (
              <Paper
                key={entry.brand}
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  opacity: paired ? 0.5 : 1, cursor: paired ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': paired ? {} : { borderColor: '#1e88e5', bgcolor: '#e3f2fd08' },
                }}
                onClick={() => !paired && handlePair(entry)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography sx={{ fontSize: 28 }}>{entry.icon}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{entry.model}</Typography>
                  </Box>
                  {paired && <Chip label="Paired" size="small" color="success" variant="outlined" sx={{ fontSize: 10, height: 22 }} />}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.4 }}>
                  {entry.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                  {entry.supportedMetrics.slice(0, 6).map((m) => (
                    <Chip key={m} label={`${METRIC_META[m].emoji} ${METRIC_META[m].label}`} size="small" sx={{ fontSize: 9, height: 18 }} />
                  ))}
                  {entry.supportedMetrics.length > 6 && (
                    <Chip label={`+${entry.supportedMetrics.length - 6}`} size="small" sx={{ fontSize: 9, height: 18 }} />
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Device Card ────────────────────────────────────────

function DeviceCard({ device }: { device: WearableDevice }) {
  const dk = useTheme().palette.mode === 'dark';
  const { syncDevice, unpairDevice, toggleAutoSync, toggleMetric } = useWearablesStore();
  const [showSettings, setShowSettings] = useState(false);
  const meta = DEVICE_TYPE_META[device.type];
  const readings = useWearablesStore((s) => s.readings.filter((r) => r.deviceId === device.id));
  const latestByMetric = new Map<HealthMetric, (typeof readings)[0]>();
  readings.forEach((r) => { if (!latestByMetric.has(r.metric)) latestByMetric.set(r.metric, r); });

  const handleDisconnectBLE = useCallback(async () => {
    if (device.bleDeviceId) {
      await bleService.disconnect(device.bleDeviceId);
      toast.success(`${device.name} disconnected`);
    }
  }, [device.bleDeviceId, device.name]);

  const isLiveBLE = device.isRealDevice && device.connectionStatus === 'connected';

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: isLiveBLE ? '#4caf50' : dk ? 'rgba(255,255,255,0.12)' : '#e0e0e0', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: isLiveBLE ? (dk ? 'rgba(76,175,80,0.1)' : '#f1f8e9') : (dk ? 'rgba(255,255,255,0.03)' : '#fafafa') }}>
        <Typography sx={{ fontSize: 32 }}>{meta.emoji}</Typography>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{device.name}</Typography>
            {device.isRealDevice && (
              <Chip
                icon={<BluetoothConnectedIcon sx={{ fontSize: 12 }} />}
                label={isLiveBLE ? 'LIVE' : 'BLE'}
                size="small"
                sx={{
                  fontSize: 9, height: 20, fontWeight: 700,
                  bgcolor: isLiveBLE ? '#4caf50' : (dk ? 'rgba(255,255,255,0.2)' : '#9e9e9e'), color: '#fff',
                  '& .MuiChip-icon': { color: '#fff', ml: 0.5 },
                  ...(isLiveBLE ? { animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } } } : {}),
                }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">{device.model} · fw {device.firmwareVersion}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right', mr: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Box sx={{ width: 24, height: 10, borderRadius: 1, border: '1.5px solid', borderColor: batteryColor(device.batteryLevel), position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ width: `${device.batteryLevel}%`, height: '100%', bgcolor: batteryColor(device.batteryLevel) }} />
            </Box>
            <Typography variant="caption" sx={{ fontSize: 10, color: batteryColor(device.batteryLevel), fontWeight: 600 }}>{device.batteryLevel}%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.25 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor(device.connectionStatus) }} />
            <Typography variant="caption" sx={{ fontSize: 9, textTransform: 'capitalize', color: statusColor(device.connectionStatus) }}>{device.connectionStatus}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Latest Readings */}
      <Box sx={{ p: 2 }}>
        {!device.isRealDevice && (
          <Alert severity="info" sx={{ mb: 1.5, py: 0.25, fontSize: 11, '& .MuiAlert-message': { py: 0.5 } }}>
            [*] Readings are estimated — pair via Bluetooth for live data
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
          {device.metrics.filter((m) => m.enabled).slice(0, 8).map((mc) => {
            const latest = latestByMetric.get(mc.metric);
            const mm = METRIC_META[mc.metric];
            const isAbnormal = latest && mm.normalRange && (latest.value < mm.normalRange[0] || latest.value > mm.normalRange[1]);
            return (
              <Box key={mc.metric} sx={{ textAlign: 'center', p: 0.75, borderRadius: 1.5, bgcolor: isAbnormal ? (dk ? 'rgba(255,152,0,0.15)' : '#fff3e0') : (dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5') }}>
                <Typography sx={{ fontSize: 14 }}>{mm.emoji}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: isAbnormal ? (dk ? '#ffb74d' : '#e65100') : 'text.primary', fontSize: 15 }}>
                  {latest ? latest.value : '—'}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', display: 'block' }}>{mm.label}</Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
            Synced: {timeAgo(device.lastSyncedAt)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {device.isRealDevice && isLiveBLE && (
              <Tooltip title="Disconnect Bluetooth">
                <IconButton size="small" onClick={handleDisconnectBLE} sx={{ color: '#f44336' }}>
                  <BluetoothIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Sync now">
              <IconButton size="small" onClick={() => { syncDevice(device.id); toast.success('Synced!'); }} sx={{ color: '#1e88e5' }}>
                <SyncIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small" onClick={() => setShowSettings(!showSettings)}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Unpair">
              <IconButton size="small" onClick={() => { unpairDevice(device.id); toast.success('Device removed'); }} sx={{ color: dk ? 'rgba(255,255,255,0.3)' : '#9e9e9e' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Settings panel */}
      {showSettings && (
        <Box sx={{ p: 2, pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Auto-Sync</Typography>
            <Switch size="small" checked={device.isAutoSync} onChange={() => toggleAutoSync(device.id)} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Tracked Metrics</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {device.metrics.map((mc) => (
              <Chip
                key={mc.metric}
                label={`${METRIC_META[mc.metric].emoji} ${METRIC_META[mc.metric].label}`}
                size="small"
                variant={mc.enabled ? 'filled' : 'outlined'}
                onClick={() => toggleMetric(device.id, mc.metric)}
                sx={{ fontSize: 10, height: 24, bgcolor: mc.enabled ? (dk ? 'rgba(30,136,229,0.15)' : '#e3f2fd') : undefined, fontWeight: mc.enabled ? 600 : 400 }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}

// ─── Alerts Panel ───────────────────────────────────────

function AlertsPanel() {
  const { alerts, dismissAlert, dismissAllAlerts } = useWearablesStore();
  const active = alerts.filter((a) => !a.dismissed);

  if (active.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">No active alerts</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{active.length} Active Alert{active.length > 1 ? 's' : ''}</Typography>
        <Button size="small" onClick={dismissAllAlerts} sx={{ textTransform: 'none', fontSize: 11 }}>Dismiss All</Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {active.map((alert) => (
          <Alert
            key={alert.id}
            severity={severityColor(alert.severity)}
            onClose={() => dismissAlert(alert.id)}
            sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: 12 } }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{alert.deviceName}</Typography>
            {alert.message}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{timeAgo(alert.timestamp)}</Typography>
          </Alert>
        ))}
      </Box>
    </Box>
  );
}

// ─── Admin: Student Monitor ─────────────────────────────

function AdminStudentMonitor() {
  const dk = useTheme().palette.mode === 'dark';
  const { studentProfiles, loadStudentProfiles, syncStudentDevice } = useWearablesStore();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWearableProfile | null>(null);

  useEffect(() => { loadStudentProfiles(); }, [loadStudentProfiles]);

  const filtered = studentProfiles.filter((s) =>
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentEmail.toLowerCase().includes(search.toLowerCase()),
  );

  const totalAlerts = studentProfiles.reduce((acc, s) => acc + s.alerts.filter((a) => !a.dismissed).length, 0);
  const connectedCount = studentProfiles.filter((s) => s.devices.some((d) => d.connectionStatus === 'connected')).length;

  return (
    <Box>
      {/* Summary stats */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'Students', value: studentProfiles.length, color: undefined },
          { label: 'Connected', value: connectedCount, color: '#4caf50' },
          { label: 'Total Devices', value: studentProfiles.reduce((a, s) => a + s.devices.length, 0), color: undefined },
          { label: 'Active Alerts', value: totalAlerts, color: totalAlerts > 0 ? '#f44336' : '#4caf50' },
        ].map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: '1 1 140px', minWidth: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{stat.label}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
          </Paper>
        ))}
      </Box>

      <TextField
        placeholder="Search students..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2 }}
      />

      {/* Student Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fafafa' }}>
              {['Student', 'Devices', 'Health Score', 'Key Metrics', 'Alerts', 'Last Sync', 'Actions'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((student) => {
              const activeAlerts = student.alerts.filter((a) => !a.dismissed);
              const hr = student.latestReadings['heart-rate'];
              const steps = student.latestReadings['steps'];
              const sleep = student.latestReadings['sleep-duration'] || student.latestReadings['sleep-score'];
              return (
                <TableRow
                  key={student.studentId}
                  hover
                  sx={{ cursor: 'pointer', bgcolor: activeAlerts.some((a) => a.severity === 'critical') ? (dk ? 'rgba(255,152,0,0.12)' : '#fff3e0') : undefined }}
                  onClick={() => setSelectedStudent(student)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 600, bgcolor: dk ? 'rgba(255,255,255,0.15)' : '#9e9e9e' }}>
                        {student.studentName.split(' ').map((n) => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{student.studentName}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{student.studentEmail}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      {student.devices.map((d) => (
                        <Tooltip key={d.id} title={`${d.name} (${d.connectionStatus})`}>
                          <Chip
                            label={DEVICE_TYPE_META[d.type].emoji}
                            size="small"
                            sx={{
                              fontSize: 12, height: 22, minWidth: 22,
                              bgcolor: d.connectionStatus === 'connected' ? (dk ? 'rgba(76,175,80,0.15)' : '#e8f5e9') : d.connectionStatus === 'error' ? (dk ? 'rgba(244,67,54,0.15)' : '#ffebee') : (dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5'),
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ flex: 1, maxWidth: 60 }}>
                        <LinearProgress
                          variant="determinate"
                          value={student.healthScore}
                          sx={{
                            height: 6, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#e0e0e0',
                            '& .MuiLinearProgress-bar': { bgcolor: student.healthScore > 80 ? '#4caf50' : student.healthScore > 60 ? '#ff9800' : '#f44336', borderRadius: 3 },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: student.healthScore > 80 ? '#4caf50' : student.healthScore > 60 ? '#ff9800' : '#f44336' }}>
                        {student.healthScore}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      {hr && <Chip label={`❤️ ${hr.value}`} size="small" sx={{ fontSize: 10, height: 20 }} />}
                      {steps && <Chip label={`👟 ${steps.value}`} size="small" sx={{ fontSize: 10, height: 20 }} />}
                      {sleep && <Chip label={`😴 ${sleep.value}`} size="small" sx={{ fontSize: 10, height: 20 }} />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {activeAlerts.length > 0 ? (
                      <Badge badgeContent={activeAlerts.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 16, minWidth: 16 } }}>
                        <WarningAmberIcon sx={{ fontSize: 18, color: activeAlerts.some((a) => a.severity === 'critical') ? '#f44336' : '#ff9800' }} />
                      </Badge>
                    ) : (
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontSize: 10 }}>{timeAgo(student.lastActivity)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Sync all devices">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          student.devices.forEach((d) => syncStudentDevice(student.studentId, d.id));
                          toast.success(`Synced ${student.studentName}'s devices`);
                        }}
                      >
                        <SyncIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Student detail dialog */}
      <Dialog open={!!selectedStudent} onClose={() => setSelectedStudent(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedStudent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 600, bgcolor: '#1e88e5' }}>
                  {selectedStudent.studentName.split(' ').map((n) => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>{selectedStudent.studentName}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedStudent.studentEmail}</Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    label={`Health: ${selectedStudent.healthScore}%`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: selectedStudent.healthScore > 80 ? (dk ? 'rgba(76,175,80,0.15)' : '#e8f5e9') : selectedStudent.healthScore > 60 ? (dk ? 'rgba(255,152,0,0.15)' : '#fff3e0') : (dk ? 'rgba(244,67,54,0.15)' : '#ffebee'),
                      color: selectedStudent.healthScore > 80 ? (dk ? '#66bb6a' : '#2e7d32') : selectedStudent.healthScore > 60 ? (dk ? '#ffb74d' : '#e65100') : (dk ? '#ef5350' : '#c62828'),
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Devices */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Devices</Typography>
              {selectedStudent.devices.map((d) => (
                <Paper key={d.id} elevation={0} sx={{ p: 1.5, mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: 20 }}>{DEVICE_TYPE_META[d.type].emoji}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name} {d.model}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor(d.connectionStatus) }} />
                          <Typography variant="caption" sx={{ fontSize: 9, textTransform: 'capitalize' }}>{d.connectionStatus}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: 9 }}>Battery: {d.batteryLevel}%</Typography>
                        <Typography variant="caption" sx={{ fontSize: 9 }}>Synced: {timeAgo(d.lastSyncedAt)}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap', mt: 1 }}>
                    {d.metrics.filter((m) => m.enabled).map((m) => (
                      <Chip key={m.metric} label={`${METRIC_META[m.metric].emoji} ${METRIC_META[m.metric].label}`} size="small" sx={{ fontSize: 9, height: 18 }} />
                    ))}
                  </Box>
                </Paper>
              ))}

              {/* Latest Readings */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Latest Readings</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 0.75 }}>
                {Object.entries(selectedStudent.latestReadings).map(([metric, data]) => {
                  const mm = METRIC_META[metric as HealthMetric];
                  if (!mm) return null;
                  const isAbnormal = mm.normalRange && (data.value < mm.normalRange[0] || data.value > mm.normalRange[1]);
                  return (
                    <Box key={metric} sx={{ textAlign: 'center', p: 0.75, borderRadius: 1.5, bgcolor: isAbnormal ? (dk ? 'rgba(255,152,0,0.15)' : '#fff3e0') : (dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5') }}>
                      <Typography sx={{ fontSize: 14 }}>{mm.emoji}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: isAbnormal ? (dk ? '#ffb74d' : '#e65100') : 'text.primary' }}>
                        {data.value}{data.unit && data.unit !== 'steps' ? ` ${data.unit}` : ''}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary' }}>{mm.label}</Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Alerts */}
              {selectedStudent.alerts.filter((a) => !a.dismissed).length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Alerts</Typography>
                  {selectedStudent.alerts.filter((a) => !a.dismissed).map((alert) => (
                    <Alert key={alert.id} severity={severityColor(alert.severity)} sx={{ mb: 0.5, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
                      <strong>{alert.deviceName}:</strong> {alert.message}
                    </Alert>
                  ))}
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelectedStudent(null)} sx={{ textTransform: 'none' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// ═══════════════════ MAIN PAGE ═══════════════════════════

export default function WearablesPage() {
  const { devices, syncAllDevices, handleBLEReading, handleBLEDisconnect } = useWearablesStore();
  const [tab, setTab] = useState(0);
  const [pairOpen, setPairOpen] = useState(false);
  const alerts = useWearablesStore((s) => s.alerts.filter((a) => !a.dismissed));

  // Wire up BLE live data events
  useEffect(() => {
    const unsubReading = bleService.onReading((reading) => {
      handleBLEReading(reading);
    });
    const unsubDisconnect = bleService.onDisconnect((deviceId) => {
      handleBLEDisconnect(deviceId);
    });
    return () => {
      unsubReading();
      unsubDisconnect();
    };
  }, [handleBLEReading, handleBLEDisconnect]);

  return (
    <Box sx={{ py: 1.5, px: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 20 }}>Wearables</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            Connect and monitor health devices for real-time tracking.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {devices.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={() => { syncAllDevices(); toast.success('All devices synced'); }}
              sx={{ textTransform: 'none', fontSize: 12, borderRadius: 2 }}
            >
              Sync All
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setPairOpen(true)}
            sx={{ textTransform: 'none', fontSize: 12, borderRadius: 2, bgcolor: '#1e88e5' }}
          >
            Pair Device
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mt: 1.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '1px solid', borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13 },
          }}
        >
          <Tab icon={<BluetoothConnectedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`My Devices (${devices.length})`} />
          <Tab
            icon={
              <Badge badgeContent={alerts.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 14, minWidth: 14 } }}>
                <NotificationsActiveIcon sx={{ fontSize: 16 }} />
              </Badge>
            }
            iconPosition="start"
            label="Alerts"
          />
          <Tab icon={<PeopleIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Student Monitor (Admin)" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            devices.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <BluetoothIcon sx={{ fontSize: 56, opacity: 0.2, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>No Devices Paired</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 360, mx: 'auto' }}>
                  Connect your smart watch, ring, fitness band, scale, or other health devices to start tracking automatically.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setPairOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#1e88e5' }}
                >
                  Pair Your First Device
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1.5 }}>
                {devices.map((d) => <DeviceCard key={d.id} device={d} />)}
              </Box>
            )
          )}

          {tab === 1 && <AlertsPanel />}
          {tab === 2 && <AdminStudentMonitor />}
        </Box>
      </Paper>

      <PairDeviceDialog open={pairOpen} onClose={() => setPairOpen(false)} />
    </Box>
  );
}
