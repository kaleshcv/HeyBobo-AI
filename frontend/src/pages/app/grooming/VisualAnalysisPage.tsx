import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Grid, Chip, Alert,
  CircularProgress, LinearProgress, Avatar, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Snackbar,
  Divider,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FaceIcon from '@mui/icons-material/Face';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LightModeIcon from '@mui/icons-material/LightMode';
import PaletteIcon from '@mui/icons-material/Palette';
import StraightenIcon from '@mui/icons-material/Straighten';
import { groomingApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import {
  performDetailedSkinAnalysis,
  performDetailedHairFaceAnalysis,
  performDetailedBodyStyleAnalysis,
  compareProgressPhotos,
  virtualStyleTryOn,
  type DetailedSkinAnalysis,
  type DetailedHairFaceAnalysis,
  type DetailedBodyStyleAnalysis,
  type ProgressComparisonResult,
  type VirtualTryOnResult,
  type VisualAnalysisMetric,
} from '@/lib/gemini';

const USER_ID = 'demo-user';

const COLORS = {
  skin: '#e91e63',
  hair: '#2196f3',
  body: '#ff9800',
  progress: '#4caf50',
  tryOn: '#9c27b0',
};

const getScoreColor = (score: number) =>
  score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336';

const getSeverityColor = (severity: string) =>
  severity === 'severe' ? '#f44336' : severity === 'moderate' ? '#ff9800' : severity === 'mild' ? '#ffc107' : '#4caf50';

const getSeverityIcon = (severity: string) =>
  severity === 'severe' ? <ErrorIcon /> : severity === 'moderate' ? <WarningAmberIcon /> : severity === 'mild' ? <InfoIcon /> : <CheckCircleIcon />;

// ═══════════ MAIN COMPONENT ═════════════════════════════

export default function VisualAnalysisPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackMsg, setSnackMsg] = useState('');

  // Analysis results
  const [skinAnalysis, setSkinAnalysis] = useState<DetailedSkinAnalysis | null>(null);
  const [hairAnalysis, setHairAnalysis] = useState<DetailedHairFaceAnalysis | null>(null);
  const [bodyAnalysis, setBodyAnalysis] = useState<DetailedBodyStyleAnalysis | null>(null);
  const [progressResult, setProgressResult] = useState<ProgressComparisonResult | null>(null);
  const [tryOnResult, setTryOnResult] = useState<VirtualTryOnResult | null>(null);

  // Progress tracking
  const [progressTimeline, setProgressTimeline] = useState<any[]>([]);
  const [progressType, setProgressType] = useState<'skin' | 'hair_face' | 'body_style'>('skin');

  // Try-on state
  const [tryOnDescription, setTryOnDescription] = useState('');

  // File refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const beforeFileRef = useRef<HTMLInputElement>(null);
  const afterFileRef = useRef<HTMLInputElement>(null);
  const tryOnFileRef = useRef<HTMLInputElement>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Profile
  const [profile, setProfile] = useState<any>(null);

  // History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadProgressTimeline();
  }, []);

  useEffect(() => {
    if (tab === 3) loadProgressTimeline();
  }, [tab, progressType]);

  const loadProfile = async () => {
    try {
      const res = await groomingApi.getProfile(USER_ID);
      setProfile(res.data?.data || res.data || null);
    } catch (e) { errorLogger.warn('Failed to load profile', 'VisualAnalysis', { meta: { error: String(e) } }); }
  };

  const loadProgressTimeline = async () => {
    try {
      const res = await groomingApi.getProgressTimeline(progressType, USER_ID);
      setProgressTimeline(res.data?.data || res.data || []);
    } catch (e) { errorLogger.warn('Failed to load progress timeline', 'VisualAnalysis', { meta: { error: String(e), progressType } }); }
  };

  const loadHistory = async () => {
    try {
      const type = tab === 0 ? 'skin' : tab === 1 ? 'hair_face' : 'body_style';
      const res = await groomingApi.getVisualAnalyses({ type }, USER_ID);
      setHistory(res.data?.data || res.data || []);
    } catch (e) { errorLogger.warn('Failed to load history', 'VisualAnalysis', { meta: { error: String(e) } }); }
  };

  // ═══════════ ANALYSIS HANDLERS ════════════════════════

  const handleAnalysisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    setError('');
    try {
      const type = tab === 0 ? 'skin' : tab === 1 ? 'hair_face' : 'body_style';
      let result: any;
      if (tab === 0) {
        result = await performDetailedSkinAnalysis(file, profile);
        setSkinAnalysis(result);
      } else if (tab === 1) {
        result = await performDetailedHairFaceAnalysis(file, profile);
        setHairAnalysis(result);
      } else {
        result = await performDetailedBodyStyleAnalysis(file, profile);
        setBodyAnalysis(result);
      }
      // Save to backend
      await groomingApi.saveVisualAnalysis({
        type,
        title: `${type.replace('_', ' ')} analysis`,
        overallScore: result.overallScore,
        metrics: result.metrics,
        summary: result.summary,
        detectedConcerns: result.detectedConcerns,
        recommendations: result.recommendations,
        productSuggestions: result.productSuggestions,
        detailedResult: result.detailedResult,
      }, USER_ID);
      setSnackMsg('Analysis complete & saved!');
    } catch (e: any) {
      errorLogger.error(e?.message || 'Analysis failed', 'VisualAnalysis', { stack: e?.stack, meta: { action: 'handleAnalysisUpload', tab } });
      setError(e?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressCompare = async () => {
    if (!beforeFile || !afterFile) {
      setError('Please select both before and after photos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await compareProgressPhotos(beforeFile, afterFile, progressType);
      setProgressResult(result);
      setSnackMsg('Progress comparison complete!');
    } catch (e: any) {
      errorLogger.error(e?.message || 'Comparison failed', 'VisualAnalysis', { stack: e?.stack, meta: { action: 'handleProgressCompare' } });
      setError(e?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTryOn = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (!tryOnDescription.trim()) {
      setError('Please describe the style/look you want to try');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await virtualStyleTryOn(file, tryOnDescription, profile);
      setTryOnResult(result);
      setSnackMsg('Style analysis complete!');
    } catch (e: any) {
      errorLogger.error(e?.message || 'Try-on analysis failed', 'VisualAnalysis', { stack: e?.stack, meta: { action: 'handleTryOn' } });
      setError(e?.message || 'Try-on analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await groomingApi.deleteVisualAnalysis(id, USER_ID);
      loadHistory();
    } catch (e) { errorLogger.warn('Failed to delete visual analysis', 'VisualAnalysis', { meta: { error: String(e), id } }); }
  };

  const loadHistoryItem = (item: any) => {
    const data = {
      overallScore: item.overallScore,
      summary: item.summary,
      detectedConcerns: item.detectedConcerns || [],
      metrics: item.metrics || [],
      recommendations: item.recommendations || [],
      productSuggestions: item.productSuggestions || [],
      detailedResult: item.detailedResult || {},
    };
    if (item.type === 'skin') { setSkinAnalysis(data as any); setTab(0); }
    else if (item.type === 'hair_face') { setHairAnalysis(data as any); setTab(1); }
    else { setBodyAnalysis(data as any); setTab(2); }
    setHistoryOpen(false);
  };

  const getTabColor = () =>
    tab === 0 ? COLORS.skin : tab === 1 ? COLORS.hair : tab === 2 ? COLORS.body : tab === 3 ? COLORS.progress : COLORS.tryOn;

  // ═══════════ RENDER ═══════════════════════════════════

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CameraAltIcon sx={{ fontSize: 28, color: '#e91e63' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Visual Analysis
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<HistoryIcon />}
          onClick={() => { setHistoryOpen(true); loadHistory(); }}
          sx={{ textTransform: 'none' }}
        >
          History
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}
      >
        <Tab icon={<FaceIcon />} iconPosition="start" label="Skin Analysis" />
        <Tab icon={<ContentCutIcon />} iconPosition="start" label="Hair & Face" />
        <Tab icon={<CheckroomIcon />} iconPosition="start" label="Body & Style" />
        <Tab icon={<TimelineIcon />} iconPosition="start" label="Progress Tracking" />
        <Tab icon={<ViewInArIcon />} iconPosition="start" label="Virtual Try-On" />
      </Tabs>

      {/* Skin / Hair / Body Analysis Tabs (0-2) */}
      {tab < 3 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5, mb: 3, borderRadius: 3,
            borderColor: `${getTabColor()}30`,
            background: `linear-gradient(135deg, ${getTabColor()}08 0%, transparent 100%)`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Avatar sx={{ bgcolor: `${getTabColor()}15`, width: 48, height: 48 }}>
              {tab === 0 ? <FaceIcon sx={{ color: getTabColor() }} /> : tab === 1 ? <ContentCutIcon sx={{ color: getTabColor() }} /> : <CheckroomIcon sx={{ color: getTabColor() }} />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {tab === 0 ? 'AI Skin Scanner' : tab === 1 ? 'Hair & Face Shape Analysis' : 'Body & Style Assessment'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tab === 0
                  ? 'Upload a clear selfie for comprehensive skin health analysis — hydration, pores, texture, pigmentation & more'
                  : tab === 1
                    ? 'Analyze face shape, hair type, density & get personalized hairstyle recommendations'
                    : 'Assess body proportions, skin tone, and get color & fit recommendations'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{
                textTransform: 'none', bgcolor: getTabColor(), borderRadius: 2, px: 3,
                '&:hover': { bgcolor: getTabColor(), filter: 'brightness(0.9)' },
              }}
            >
              {loading ? 'Analyzing...' : 'Upload Photo'}
            </Button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAnalysisUpload} />
          </Box>
        </Paper>
      )}

      {/* Progress Tracking Tab (3) */}
      {tab === 3 && <ProgressTrackingSection
        progressType={progressType}
        setProgressType={setProgressType}
        progressTimeline={progressTimeline}
        progressResult={progressResult}
        beforeFile={beforeFile}
        afterFile={afterFile}
        setBeforeFile={setBeforeFile}
        setAfterFile={setAfterFile}
        beforeFileRef={beforeFileRef}
        afterFileRef={afterFileRef}
        onCompare={handleProgressCompare}
        loading={loading}
      />}

      {/* Virtual Try-On Tab (4) */}
      {tab === 4 && <VirtualTryOnSection
        tryOnDescription={tryOnDescription}
        setTryOnDescription={setTryOnDescription}
        tryOnResult={tryOnResult}
        tryOnFileRef={tryOnFileRef}
        onUpload={handleTryOn}
        loading={loading}
      />}

      {/* Results */}
      {tab === 0 && skinAnalysis && <SkinAnalysisResults result={skinAnalysis} />}
      {tab === 1 && hairAnalysis && <HairFaceResults result={hairAnalysis} />}
      {tab === 2 && bodyAnalysis && <BodyStyleResults result={bodyAnalysis} />}

      {/* Empty States */}
      {tab === 0 && !skinAnalysis && !loading && <EmptyAnalysis type="skin" color={COLORS.skin} icon={<FaceIcon sx={{ fontSize: 48 }} />} />}
      {tab === 1 && !hairAnalysis && !loading && <EmptyAnalysis type="hair & face" color={COLORS.hair} icon={<ContentCutIcon sx={{ fontSize: 48 }} />} />}
      {tab === 2 && !bodyAnalysis && !loading && <EmptyAnalysis type="body & style" color={COLORS.body} icon={<CheckroomIcon sx={{ fontSize: 48 }} />} />}

      {/* History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Analysis History</DialogTitle>
        <DialogContent>
          {history.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No previous analyses</Typography>
          ) : (
            history.map((item: any) => (
              <Paper
                key={item._id}
                variant="outlined"
                sx={{ p: 2, mb: 1, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                onClick={() => loadHistoryItem(item)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip size="small" label={`Score: ${item.overallScore}`} sx={{ bgcolor: `${getScoreColor(item.overallScore)}15`, color: getScoreColor(item.overallScore), fontWeight: 600 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item._id); }}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setHistoryOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackMsg}
        autoHideDuration={3000}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ═══════════ METRICS DISPLAY ════════════════════════════

function MetricsGrid({ metrics, color }: { metrics: VisualAnalysisMetric[]; color: string }) {
  return (
    <Grid container spacing={2}>
      {metrics.map((metric, i) => (
        <Grid item xs={12} sm={6} key={i}>
          <Paper
            variant="outlined"
            sx={{
              p: 2, borderRadius: 2.5, height: '100%',
              borderColor: `${getScoreColor(metric.score)}25`,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${getScoreColor(metric.score)}15` },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: `${getSeverityColor(metric.severity)}15` }}>
                  {React.cloneElement(getSeverityIcon(metric.severity), { sx: { fontSize: 16, color: getSeverityColor(metric.severity) } })}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{metric.name}</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: getScoreColor(metric.score) }}>
                {metric.score}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metric.score}
              sx={{
                height: 6, borderRadius: 3, mb: 1.5,
                bgcolor: `${getScoreColor(metric.score)}15`,
                '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(metric.score), borderRadius: 3 },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>{metric.description}</Typography>
            {metric.severity !== 'none' && (
              <Chip
                size="small"
                label={metric.severity}
                sx={{
                  bgcolor: `${getSeverityColor(metric.severity)}12`,
                  color: getSeverityColor(metric.severity),
                  fontWeight: 600, fontSize: 11, mb: 1, textTransform: 'capitalize',
                }}
              />
            )}
            {metric.recommendations.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {metric.recommendations.map((rec, j) => (
                  <Typography key={j} variant="caption" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.3, color: color }}>
                    <AutoAwesomeIcon sx={{ fontSize: 12, mt: '2px', flexShrink: 0 }} /> {rec}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

// ═══════════ SKIN ANALYSIS RESULTS ══════════════════════

function SkinAnalysisResults({ result }: { result: DetailedSkinAnalysis }) {
  const color = COLORS.skin;

  return (
    <Box>
      {/* Hero Banner */}
      <Paper
        sx={{
          p: 0, mb: 3, borderRadius: 3, overflow: 'hidden',
          background: `linear-gradient(135deg, ${color}12 0%, ${color}05 50%, #fff 100%)`,
          border: `1px solid ${color}20`,
        }}
      >
        <Grid container>
          <Grid item xs={12} md={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: { md: `1px solid ${color}15` } }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress variant="determinate" value={100} size={120} thickness={4} sx={{ color: '#eee', position: 'absolute' }} />
              <CircularProgress variant="determinate" value={result.overallScore} size={120} thickness={4} sx={{ color: getScoreColor(result.overallScore) }} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: getScoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>SKIN SCORE</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={9} sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color, fontSize: 20 }} /> Comprehensive Skin Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>{result.summary}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {result.detectedConcerns.map((c, i) => (
                <Chip key={i} size="small" label={c.replace(/_/g, ' ')} sx={{ bgcolor: `${color}12`, color, fontWeight: 600, textTransform: 'capitalize' }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Facial Zone Map */}
      {result.detailedResult?.zones && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaceIcon sx={{ color }} /> Facial Zone Analysis
          </Typography>
          <Grid container spacing={1.5}>
            {result.detailedResult.zones.map((zone, i) => (
              <Grid item xs={6} sm={4} md key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: 2, textAlign: 'center',
                    bgcolor: `${getScoreColor(zone.score)}08`,
                    border: `1px solid ${getScoreColor(zone.score)}20`,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, color: getScoreColor(zone.score), mb: 0.5 }}>{zone.score}</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{zone.zone}</Typography>
                  <Typography variant="caption" color="text.secondary">{zone.condition}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Detailed Metrics */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WaterDropIcon sx={{ color }} /> Detailed Metrics
      </Typography>
      <Box sx={{ mb: 3 }}>
        <MetricsGrid metrics={result.metrics} color={color} />
      </Box>

      {/* Skin Condition Details */}
      {result.detailedResult && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Condition Breakdown</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Hydration', value: result.detailedResult.hydrationLevel, icon: <WaterDropIcon /> },
              { label: 'Pore Analysis', value: result.detailedResult.poreAnalysis, icon: <FaceIcon /> },
              { label: 'Pigmentation', value: result.detailedResult.pigmentation, icon: <PaletteIcon /> },
              { label: 'Texture', value: result.detailedResult.textureAssessment, icon: <StraightenIcon /> },
              { label: 'Environmental Damage', value: result.detailedResult.environmentalDamage, icon: <LightModeIcon /> },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: `${color}12` }}>
                    {React.cloneElement(item.icon, { sx: { fontSize: 16, color } })}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color }}>{item.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.value}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
            {(result.detailedResult.agingIndicators || []).length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color, mr: 1 }}>Aging Indicators:</Typography>
                  {result.detailedResult.agingIndicators.map((a, i) => (
                    <Chip key={i} size="small" label={a} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontSize: 11 }} />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Product Suggestions */}
      <RecommendationsSection recommendations={result.recommendations} products={result.productSuggestions} color={color} />
    </Box>
  );
}

// ═══════════ HAIR & FACE RESULTS ════════════════════════

function HairFaceResults({ result }: { result: DetailedHairFaceAnalysis }) {
  const color = COLORS.hair;

  return (
    <Box>
      {/* Hero */}
      <Paper
        sx={{
          p: 0, mb: 3, borderRadius: 3, overflow: 'hidden',
          background: `linear-gradient(135deg, ${color}12 0%, ${color}05 50%, #fff 100%)`,
          border: `1px solid ${color}20`,
        }}
      >
        <Grid container>
          <Grid item xs={12} md={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: { md: `1px solid ${color}15` } }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress variant="determinate" value={100} size={120} thickness={4} sx={{ color: '#eee', position: 'absolute' }} />
              <CircularProgress variant="determinate" value={result.overallScore} size={120} thickness={4} sx={{ color: getScoreColor(result.overallScore) }} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: getScoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>SCORE</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={9} sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContentCutIcon sx={{ color, fontSize: 20 }} /> Hair & Face Shape Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>{result.summary}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {result.detectedConcerns.map((c, i) => (
                <Chip key={i} size="small" label={c.replace(/_/g, ' ')} sx={{ bgcolor: `${color}12`, color, fontWeight: 600, textTransform: 'capitalize' }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Face & Hair Profile */}
      {result.detailedResult && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Your Profile</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Face Shape', value: result.detailedResult.faceShape },
              { label: 'Face Symmetry', value: result.detailedResult.faceSymmetry },
              { label: 'Hair Type', value: result.detailedResult.hairType },
              { label: 'Hair Condition', value: result.detailedResult.hairCondition },
              { label: 'Hair Density', value: result.detailedResult.hairDensity },
              { label: 'Scalp Health', value: result.detailedResult.scalpHealth },
            ].map((item, i) => (
              <Grid item xs={6} sm={4} key={i}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}06`, border: `1px solid ${color}12` }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color, textTransform: 'uppercase', fontSize: 10 }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25, textTransform: 'capitalize' }}>{item.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Metrics */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ContentCutIcon sx={{ color }} /> Detailed Metrics
      </Typography>
      <Box sx={{ mb: 3 }}>
        <MetricsGrid metrics={result.metrics} color={color} />
      </Box>

      {/* Best Hairstyles */}
      {result.detailedResult?.bestHairstyles && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color }} /> Recommended Hairstyles
          </Typography>
          <Grid container spacing={2}>
            {result.detailedResult.bestHairstyles.map((style, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5, borderRadius: 2.5, height: '100%',
                    bgcolor: `${color}06`, border: `1px solid ${color}15`,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${color}15` },
                  }}
                >
                  <Avatar sx={{ width: 40, height: 40, bgcolor: `${color}15`, mb: 1.5 }}>
                    <ContentCutIcon sx={{ color }} />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{style.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{style.description}</Typography>
                  <Chip size="small" label={style.suitability} sx={{ bgcolor: `${color}12`, color, fontSize: 11, fontWeight: 600 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Additional Info */}
      {result.detailedResult && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {result.detailedResult.facialHairAdvice && (
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color }}>Facial Hair Advice</Typography>
                <Typography variant="body2" color="text.secondary">{result.detailedResult.facialHairAdvice}</Typography>
              </Paper>
            </Grid>
          )}
          {result.detailedResult.colorRecommendation && (
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color }}>Color Recommendation</Typography>
                <Typography variant="body2" color="text.secondary">{result.detailedResult.colorRecommendation}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <RecommendationsSection recommendations={result.recommendations} products={result.productSuggestions} color={color} />
    </Box>
  );
}

// ═══════════ BODY & STYLE RESULTS ═══════════════════════

function BodyStyleResults({ result }: { result: DetailedBodyStyleAnalysis }) {
  const color = COLORS.body;

  return (
    <Box>
      {/* Hero */}
      <Paper
        sx={{
          p: 0, mb: 3, borderRadius: 3, overflow: 'hidden',
          background: `linear-gradient(135deg, ${color}12 0%, ${color}05 50%, #fff 100%)`,
          border: `1px solid ${color}20`,
        }}
      >
        <Grid container>
          <Grid item xs={12} md={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: { md: `1px solid ${color}15` } }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress variant="determinate" value={100} size={120} thickness={4} sx={{ color: '#eee', position: 'absolute' }} />
              <CircularProgress variant="determinate" value={result.overallScore} size={120} thickness={4} sx={{ color: getScoreColor(result.overallScore) }} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: getScoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>STYLE</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={9} sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckroomIcon sx={{ color, fontSize: 20 }} /> Body & Style Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>{result.summary}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {result.detectedConcerns.map((c, i) => (
                <Chip key={i} size="small" label={c.replace(/_/g, ' ')} sx={{ bgcolor: `${color}12`, color, fontWeight: 600, textTransform: 'capitalize' }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Style Profile Card */}
      {result.detailedResult && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Your Style Profile</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Body Type', value: result.detailedResult.bodyType },
              { label: 'Proportions', value: result.detailedResult.proportions },
              { label: 'Skin Tone', value: result.detailedResult.skinTone },
              { label: 'Color Season', value: result.detailedResult.colorSeason },
              { label: 'Style Personality', value: result.detailedResult.stylePersonality },
              { label: 'Signature Look', value: result.detailedResult.signatureLook },
            ].map((item, i) => (
              <Grid item xs={6} sm={4} key={i}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}06`, border: `1px solid ${color}12` }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color, textTransform: 'uppercase', fontSize: 10 }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25, textTransform: 'capitalize' }}>{item.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Color Palette */}
      {result.detailedResult && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon sx={{ color }} /> Your Color Palette
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#4caf50' }}>Best Colors</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(result.detailedResult.bestColors || []).map((c, i) => (
                  <Chip key={i} size="small" label={c} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, textTransform: 'capitalize' }} />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#f44336' }}>Colors to Avoid</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(result.detailedResult.avoidColors || []).map((c, i) => (
                  <Chip key={i} size="small" label={c} sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600, textTransform: 'capitalize' }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Fit Recommendations */}
      {result.detailedResult?.fitRecommendations && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <StraightenIcon sx={{ color }} /> Fit Recommendations
          </Typography>
          <Grid container spacing={2}>
            {result.detailedResult.fitRecommendations.map((fit, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: 2, height: '100%',
                    bgcolor: `${color}06`, border: `1px solid ${color}12`,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${color}10` },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color, mb: 0.5 }}>{fit.category}</Typography>
                  <Typography variant="body2" color="text.secondary">{fit.advice}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Metrics */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckroomIcon sx={{ color }} /> Detailed Metrics
      </Typography>
      <Box sx={{ mb: 3 }}>
        <MetricsGrid metrics={result.metrics} color={color} />
      </Box>

      <RecommendationsSection recommendations={result.recommendations} products={result.productSuggestions} color={color} />
    </Box>
  );
}

// ═══════════ PROGRESS TRACKING ══════════════════════════

function ProgressTrackingSection({
  progressType, setProgressType, progressTimeline, progressResult,
  beforeFile, afterFile, setBeforeFile, setAfterFile,
  beforeFileRef, afterFileRef, onCompare, loading,
}: {
  progressType: 'skin' | 'hair_face' | 'body_style';
  setProgressType: (t: 'skin' | 'hair_face' | 'body_style') => void;
  progressTimeline: any[];
  progressResult: ProgressComparisonResult | null;
  beforeFile: File | null;
  afterFile: File | null;
  setBeforeFile: (f: File | null) => void;
  setAfterFile: (f: File | null) => void;
  beforeFileRef: React.RefObject<HTMLInputElement>;
  afterFileRef: React.RefObject<HTMLInputElement>;
  onCompare: () => void;
  loading: boolean;
}) {
  const color = COLORS.progress;

  return (
    <Box>
      {/* Type Selector */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3, borderColor: `${color}30` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon sx={{ color }} /> Track Your Progress
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload before & after photos to see how your skin, hair, or style is improving over time
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {[
            { value: 'skin' as const, label: 'Skin', icon: <FaceIcon /> },
            { value: 'hair_face' as const, label: 'Hair & Face', icon: <ContentCutIcon /> },
            { value: 'body_style' as const, label: 'Body & Style', icon: <CheckroomIcon /> },
          ].map((opt) => (
            <Chip
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              onClick={() => setProgressType(opt.value)}
              sx={{
                fontWeight: 600,
                bgcolor: progressType === opt.value ? `${color}15` : 'transparent',
                color: progressType === opt.value ? color : 'text.secondary',
                border: `1px solid ${progressType === opt.value ? color : '#ddd'}`,
                '&:hover': { bgcolor: `${color}10` },
              }}
            />
          ))}
        </Box>

        {/* Before/After Upload */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 2, textAlign: 'center',
                border: `2px dashed ${beforeFile ? color : '#ccc'}`,
                bgcolor: beforeFile ? `${color}05` : '#fafafa',
                cursor: 'pointer',
                '&:hover': { borderColor: color, bgcolor: `${color}05` },
              }}
              onClick={() => beforeFileRef.current?.click()}
            >
              <PhotoLibraryIcon sx={{ fontSize: 36, color: beforeFile ? color : '#999', mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: beforeFile ? 'text.primary' : 'text.secondary' }}>
                {beforeFile ? beforeFile.name : 'Upload BEFORE Photo'}
              </Typography>
              <input
                type="file"
                ref={beforeFileRef}
                hidden
                accept="image/*"
                onChange={(e) => { if (e.target.files?.[0]) setBeforeFile(e.target.files[0]); e.target.value = ''; }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CompareArrowsIcon sx={{ fontSize: 32, color: '#bbb' }} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 2, textAlign: 'center',
                border: `2px dashed ${afterFile ? color : '#ccc'}`,
                bgcolor: afterFile ? `${color}05` : '#fafafa',
                cursor: 'pointer',
                '&:hover': { borderColor: color, bgcolor: `${color}05` },
              }}
              onClick={() => afterFileRef.current?.click()}
            >
              <PhotoLibraryIcon sx={{ fontSize: 36, color: afterFile ? color : '#999', mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: afterFile ? 'text.primary' : 'text.secondary' }}>
                {afterFile ? afterFile.name : 'Upload AFTER Photo'}
              </Typography>
              <input
                type="file"
                ref={afterFileRef}
                hidden
                accept="image/*"
                onChange={(e) => { if (e.target.files?.[0]) setAfterFile(e.target.files[0]); e.target.value = ''; }}
              />
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CompareArrowsIcon />}
            onClick={onCompare}
            disabled={loading || !beforeFile || !afterFile}
            sx={{
              textTransform: 'none', bgcolor: color, borderRadius: 2, px: 4,
              '&:hover': { bgcolor: color, filter: 'brightness(0.9)' },
            }}
          >
            {loading ? 'Comparing...' : 'Compare Photos'}
          </Button>
        </Box>
      </Paper>

      {/* Comparison Result */}
      {progressResult && (
        <Box>
          {/* Overall Improvement */}
          <Paper
            sx={{
              p: 3, mb: 3, borderRadius: 3,
              background: `linear-gradient(135deg, ${progressResult.overallImprovement >= 0 ? '#e8f5e9' : '#ffebee'} 0%, #fff 100%)`,
              border: `1px solid ${progressResult.overallImprovement >= 0 ? '#c8e6c9' : '#ffcdd2'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: progressResult.overallImprovement >= 0 ? '#e8f5e9' : '#ffebee' }}>
                {progressResult.overallImprovement >= 0
                  ? <TrendingUpIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                  : <TrendingDownIcon sx={{ fontSize: 28, color: '#f44336' }} />}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: progressResult.overallImprovement >= 0 ? '#4caf50' : '#f44336' }}>
                  {progressResult.overallImprovement >= 0 ? '+' : ''}{progressResult.overallImprovement}%
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Overall Improvement</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{progressResult.summary}</Typography>
          </Paper>

          {/* Metric Comparisons */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Metric Comparisons</Typography>
            <Grid container spacing={2}>
              {progressResult.metricComparisons.map((mc, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa', border: '1px solid #eee' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{mc.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Chip size="small" label={`Before: ${mc.before}`} sx={{ bgcolor: '#fff3e0', fontWeight: 600 }} />
                      <SwapHorizIcon sx={{ color: '#999', fontSize: 18 }} />
                      <Chip size="small" label={`After: ${mc.after}`} sx={{ bgcolor: mc.change >= 0 ? '#e8f5e9' : '#ffebee', fontWeight: 600 }} />
                      <Chip
                        size="small"
                        icon={mc.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={`${mc.change >= 0 ? '+' : ''}${mc.change}`}
                        sx={{
                          bgcolor: mc.change >= 0 ? '#e8f5e9' : '#ffebee',
                          color: mc.change >= 0 ? '#2e7d32' : '#c62828',
                          fontWeight: 700,
                          '& .MuiChip-icon': { color: mc.change >= 0 ? '#2e7d32' : '#c62828' },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">{mc.insight}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Improvements & Areas to Watch */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%', borderColor: '#c8e6c9' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#4caf50', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} /> Improvements
                </Typography>
                {progressResult.improvements.map((imp, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, display: 'flex', gap: 0.5 }}>
                    <span style={{ color: '#4caf50', fontWeight: 700 }}>•</span> {imp}
                  </Typography>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%', borderColor: '#fff3e0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#ff9800', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WarningAmberIcon sx={{ fontSize: 18 }} /> Areas to Watch
                </Typography>
                {progressResult.areasToWatch.map((area, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, display: 'flex', gap: 0.5 }}>
                    <span style={{ color: '#ff9800', fontWeight: 700 }}>•</span> {area}
                  </Typography>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%', borderColor: '#bbdefb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#2196f3', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} /> Next Steps
                </Typography>
                {progressResult.nextSteps.map((step, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, display: 'flex', gap: 0.5 }}>
                    <span style={{ color: '#2196f3', fontWeight: 700 }}>{i + 1}.</span> {step}
                  </Typography>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Timeline from saved analyses */}
      {progressTimeline.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon sx={{ color }} /> Score Timeline
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {progressTimeline.map((entry, i) => (
              <Paper
                key={entry._id || i}
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2, minWidth: 140, textAlign: 'center', flexShrink: 0,
                  bgcolor: `${color}06`, border: `1px solid ${color}15`,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: getScoreColor(entry.overallScore) }}>
                  {entry.overallScore}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Typography>
                {entry.tags?.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {entry.tags.slice(0, 2).map((tag: string, j: number) => (
                      <Chip key={j} size="small" label={tag} sx={{ fontSize: 9, height: 18, mr: 0.25 }} />
                    ))}
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      {/* Empty state for timeline */}
      {!progressResult && progressTimeline.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4, textAlign: 'center', borderRadius: 3,
            bgcolor: `${color}04`, border: `1px dashed ${color}30`,
          }}
        >
          <TimelineIcon sx={{ fontSize: 48, color: `${color}40`, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>No Progress Data Yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Upload before & after photos above, or run analyses from the Skin/Hair/Body tabs to build your progress timeline
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// ═══════════ VIRTUAL TRY-ON ═════════════════════════════

function VirtualTryOnSection({
  tryOnDescription, setTryOnDescription, tryOnResult, tryOnFileRef, onUpload, loading,
}: {
  tryOnDescription: string;
  setTryOnDescription: (s: string) => void;
  tryOnResult: VirtualTryOnResult | null;
  tryOnFileRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}) {
  const color = COLORS.tryOn;

  return (
    <Box>
      {/* Input Section */}
      <Paper
        variant="outlined"
        sx={{
          p: 3, mb: 3, borderRadius: 3, borderColor: `${color}30`,
          background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}15`, width: 48, height: 48 }}>
            <ViewInArIcon sx={{ color }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Virtual Style Try-On</Typography>
            <Typography variant="body2" color="text.secondary">
              Describe a style or outfit and upload your photo — AI will assess how it would look on you
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Describe the style you want to try — e.g., 'Navy blue slim-fit suit with brown Oxford shoes', 'Textured crop hairstyle', 'Minimalist streetwear look'..."
          value={tryOnDescription}
          onChange={(e) => setTryOnDescription(e.target.value)}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
        />

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
          onClick={() => tryOnFileRef.current?.click()}
          disabled={loading || !tryOnDescription.trim()}
          sx={{
            textTransform: 'none', bgcolor: color, borderRadius: 2, px: 3,
            '&:hover': { bgcolor: color, filter: 'brightness(0.9)' },
          }}
        >
          {loading ? 'Analyzing...' : 'Upload Your Photo & Analyze'}
        </Button>
        <input type="file" ref={tryOnFileRef} hidden accept="image/*" onChange={onUpload} />
      </Paper>

      {/* Try-On Results */}
      {tryOnResult && (
        <Box>
          {/* Suitability Score */}
          <Paper
            sx={{
              p: 3, mb: 3, borderRadius: 3,
              background: `linear-gradient(135deg, ${color}12 0%, #fff 100%)`,
              border: `1px solid ${color}20`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={100} size={100} thickness={4} sx={{ color: '#eee', position: 'absolute' }} />
                <CircularProgress variant="determinate" value={tryOnResult.suitabilityScore} size={100} thickness={4} sx={{ color: getScoreColor(tryOnResult.suitabilityScore) }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: getScoreColor(tryOnResult.suitabilityScore), lineHeight: 1 }}>
                    {tryOnResult.suitabilityScore}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 9 }}>SUITABILITY</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Style Assessment</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{tryOnResult.analysis}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              <PaletteIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom', color }} />
              Color Compatibility
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{tryOnResult.colorCompatibility}</Typography>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: `${color}06`, border: `1px solid ${color}15` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
                <StarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Verdict
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{tryOnResult.overallVerdict}</Typography>
            </Paper>
          </Paper>

          {/* Pros, Cons, Alternatives */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%', borderColor: '#c8e6c9' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#4caf50', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ThumbUpIcon sx={{ fontSize: 18 }} /> What Works
                </Typography>
                {tryOnResult.pros.map((pro, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, display: 'flex', gap: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: '#4caf50', mt: '3px', flexShrink: 0 }} /> {pro}
                  </Typography>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%', borderColor: '#ffcdd2' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#f44336', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ThumbDownIcon sx={{ fontSize: 18 }} /> Considerations
                </Typography>
                {tryOnResult.cons.map((con, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, display: 'flex', gap: 0.5 }}>
                    <WarningAmberIcon sx={{ fontSize: 14, color: '#f44336', mt: '3px', flexShrink: 0 }} /> {con}
                  </Typography>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%', borderColor: '#e1bee7' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SwapHorizIcon sx={{ fontSize: 18 }} /> Alternatives
                </Typography>
                {tryOnResult.alternatives.map((alt, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{alt.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{alt.reason}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Empty state */}
      {!tryOnResult && !loading && (
        <Paper
          elevation={0}
          sx={{
            p: 4, textAlign: 'center', borderRadius: 3,
            bgcolor: `${color}04`, border: `1px dashed ${color}30`,
          }}
        >
          <ViewInArIcon sx={{ fontSize: 48, color: `${color}40`, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Virtual Try-On</Typography>
          <Typography variant="body2" color="text.secondary">
            Describe a hairstyle, outfit, or look above, then upload your photo to see how it would suit you
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// ═══════════ SHARED COMPONENTS ══════════════════════════

function RecommendationsSection({ recommendations, products, color }: { recommendations: string[]; products: string[]; color: string }) {
  return (
    <>
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color }} /> Key Recommendations
          </Typography>
          {recommendations.map((rec, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: `${color}15`, fontSize: 12, fontWeight: 700, color }}>
                {i + 1}
              </Avatar>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{rec}</Typography>
            </Box>
          ))}
        </Paper>
      )}

      {/* Product Suggestions */}
      {products.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagIcon sx={{ color }} /> Product Suggestions
          </Typography>
          <Grid container spacing={1}>
            {products.map((product, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5, borderRadius: 2,
                    bgcolor: `${color}05`, border: `1px solid ${color}10`,
                    display: 'flex', alignItems: 'center', gap: 1,
                  }}
                >
                  <Avatar sx={{ width: 28, height: 28, bgcolor: `${color}15` }}>
                    <ShoppingBagIcon sx={{ fontSize: 14, color }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{product}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </>
  );
}

function EmptyAnalysis({ type, color, icon }: { type: string; color: string; icon: React.ReactElement }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 5, textAlign: 'center', borderRadius: 3, mt: 2,
        background: `linear-gradient(135deg, ${color}06 0%, ${color}02 100%)`,
        border: `1px dashed ${color}25`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Decorative ring */}
      <Box
        sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 180, height: 180, borderRadius: '50%',
          border: `2px dashed ${color}12`,
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ color: `${color}35`, mb: 2 }}>{icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
          Analyze Your {type.charAt(0).toUpperCase() + type.slice(1)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a clear photo above to get a comprehensive AI-powered {type} analysis with personalized metrics and recommendations
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Chip size="small" icon={<CameraAltIcon />} label="Clear photo" sx={{ bgcolor: `${color}10`, color }} />
          <Chip size="small" icon={<LightModeIcon />} label="Good lighting" sx={{ bgcolor: `${color}10`, color }} />
          <Chip size="small" icon={<FaceIcon />} label="No filters" sx={{ bgcolor: `${color}10`, color }} />
        </Box>
      </Box>
    </Paper>
  );
}
