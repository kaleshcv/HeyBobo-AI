import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Snackbar,
} from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import FaceIcon from '@mui/icons-material/Face';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import UploadIcon from '@mui/icons-material/Upload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import HistoryIcon from '@mui/icons-material/History';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaletteIcon from '@mui/icons-material/Palette';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScienceIcon from '@mui/icons-material/Science';
import CleanHandsIcon from '@mui/icons-material/CleanHands';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GrainIcon from '@mui/icons-material/Grain';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StraightenIcon from '@mui/icons-material/Straighten';
import WavesIcon from '@mui/icons-material/Waves';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import DiamondIcon from '@mui/icons-material/Diamond';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import RecyclingIcon from '@mui/icons-material/Recycling';
import WatchIcon from '@mui/icons-material/Watch';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import { groomingApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import {
  analyzeSkinImage,
  generateSkincareRoutine,
  analyzeHairImage,
  generateHaircareRoutine,
  analyzeOutfitImage,
  generateOutfitRecommendations,
  SkinAnalysisResult,
  HairAnalysisResult,
  OutfitAnalysisResult,
} from '@/lib/gemini';

const USER_ID = 'demo-user';

const SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
const SKIN_CONCERNS = ['acne', 'aging', 'hydration', 'dark_spots', 'redness', 'large_pores', 'wrinkles', 'dullness', 'sun_damage', 'uneven_tone'];
const HAIR_TYPES = ['straight', 'wavy', 'curly', 'coily'];
const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'];
const BODY_TYPES = ['slim', 'athletic', 'average', 'muscular', 'broad', 'plus_size'];
const STYLE_PREFS = ['casual', 'formal', 'smart_casual', 'streetwear', 'minimalist', 'classic', 'trendy', 'sporty'];
const OCCASIONS = ['work', 'casual', 'party', 'formal', 'date', 'workout', 'travel'];
const BUDGETS = ['budget', 'mid-range', 'premium'];
const SUN_EXPOSURES = ['low', 'moderate', 'high'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const HAIR_CONCERNS = ['thinning', 'dandruff', 'frizz', 'damage', 'oily_scalp', 'dry_ends', 'split_ends'];
const STYLING_PREFS = ['low-maintenance', 'trendy', 'classic', 'professional'];

const COLORS = {
  skincare: '#e91e63',
  haircare: '#ff9800',
  outfit: '#9c27b0',
};

const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('cleans')) return <WaterDropIcon />;
  if (c.includes('tone') || c.includes('toner')) return <CleanHandsIcon />;
  if (c.includes('serum') || c.includes('treatment') || c.includes('retinol')) return <ScienceIcon />;
  if (c.includes('moistur') || c.includes('cream') || c.includes('hydrat')) return <OpacityIcon />;
  if (c.includes('sun') || c.includes('spf') || c.includes('protect')) return <ShieldIcon />;
  if (c.includes('mask') || c.includes('peel')) return <SpaIcon />;
  if (c.includes('exfol') || c.includes('scrub')) return <BubbleChartIcon />;
  if (c.includes('eye')) return <VisibilityIcon />;
  if (c.includes('oil')) return <LocalFloristIcon />;
  return <SpaIcon />;
};

const getCategoryColor = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('cleans')) return '#42a5f5';
  if (c.includes('tone')) return '#ab47bc';
  if (c.includes('serum') || c.includes('treatment')) return '#66bb6a';
  if (c.includes('moistur') || c.includes('cream')) return '#29b6f6';
  if (c.includes('sun') || c.includes('spf')) return '#ffa726';
  if (c.includes('mask')) return '#ec407a';
  if (c.includes('exfol')) return '#ef5350';
  if (c.includes('eye')) return '#7e57c2';
  return '#78909c';
};

const getConcernIcon = (concern: string) => {
  const c = concern.toLowerCase().replace(/_/g, ' ');
  if (c.includes('acne') || c.includes('breakout')) return <LocalFireDepartmentIcon />;
  if (c.includes('aging') || c.includes('wrinkle') || c.includes('fine line')) return <GrainIcon />;
  if (c.includes('hydra') || c.includes('dry') || c.includes('moisture')) return <WaterDropIcon />;
  if (c.includes('dark') || c.includes('spot') || c.includes('pigment')) return <BlurOnIcon />;
  if (c.includes('red') || c.includes('sensitive') || c.includes('irritat')) return <WarningAmberIcon />;
  if (c.includes('pore')) return <GrainIcon />;
  if (c.includes('dull') || c.includes('glow')) return <AutoAwesomeIcon />;
  if (c.includes('sun')) return <WbSunnyIcon />;
  if (c.includes('uneven') || c.includes('tone')) return <PaletteIcon />;
  return <FavoriteIcon />;
};

const getConcernColor = (concern: string) => {
  const c = concern.toLowerCase().replace(/_/g, ' ');
  if (c.includes('acne')) return '#ef5350';
  if (c.includes('aging') || c.includes('wrinkle')) return '#ab47bc';
  if (c.includes('hydra') || c.includes('dry')) return '#42a5f5';
  if (c.includes('dark') || c.includes('spot')) return '#8d6e63';
  if (c.includes('red') || c.includes('sensitive')) return '#ff7043';
  if (c.includes('pore')) return '#78909c';
  if (c.includes('dull')) return '#ffd54f';
  if (c.includes('sun')) return '#ffa726';
  return '#66bb6a';
};

const colorNameToHex: Record<string, string> = {
  navy: '#001f3f', blue: '#2196f3', royal_blue: '#4169e1', light_blue: '#03a9f4', sky_blue: '#87ceeb',
  teal: '#009688', turquoise: '#40e0d0', aqua: '#00bcd4', cyan: '#00bcd4',
  green: '#4caf50', olive: '#808000', sage: '#9caf88', emerald: '#50c878', forest: '#228b22', mint: '#98ff98',
  red: '#f44336', crimson: '#dc143c', maroon: '#800000', burgundy: '#800020', scarlet: '#ff2400',
  pink: '#e91e63', coral: '#ff7f50', salmon: '#fa8072', rose: '#ff007f', blush: '#de5d83', magenta: '#e91e63',
  orange: '#ff9800', amber: '#ffc107', peach: '#ffcc99', tangerine: '#ff9966', rust: '#b7410e',
  yellow: '#ffeb3b', gold: '#ffd700', mustard: '#ffdb58', lemon: '#fff44f',
  purple: '#9c27b0', lavender: '#b39ddb', violet: '#7b1fa2', plum: '#8e4585', indigo: '#3f51b5', lilac: '#c8a2c8',
  brown: '#795548', chocolate: '#7b3f00', tan: '#d2b48c', camel: '#c19a6b', khaki: '#bdb76b', beige: '#f5f5dc', taupe: '#483c32',
  white: '#fafafa', ivory: '#fffff0', cream: '#fffdd0', off_white: '#faf0e6',
  gray: '#9e9e9e', grey: '#9e9e9e', charcoal: '#36454f', slate: '#708090', silver: '#c0c0c0', light_gray: '#d3d3d3',
  black: '#212121', jet: '#343434',
};

const resolveColor = (name: string): string => {
  const key = name.toLowerCase().replace(/[\s-]+/g, '_').trim();
  return colorNameToHex[key] || '#9e9e9e';
};

const getClothingIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('top') || t.includes('shirt') || t.includes('blouse') || t.includes('tee')) return <CheckroomIcon />;
  if (t.includes('bottom') || t.includes('pant') || t.includes('jean') || t.includes('trouser') || t.includes('skirt')) return <StraightenIcon />;
  if (t.includes('shoe') || t.includes('boot') || t.includes('sneaker') || t.includes('footwear')) return <EmojiPeopleIcon />;
  if (t.includes('jacket') || t.includes('coat') || t.includes('outerwear') || t.includes('blazer')) return <ShieldIcon />;
  if (t.includes('accessory') || t.includes('watch') || t.includes('belt') || t.includes('jewelry')) return <WatchIcon />;
  if (t.includes('bag') || t.includes('purse')) return <LocalMallIcon />;
  if (t.includes('dress') || t.includes('suit') || t.includes('formal')) return <DiamondIcon />;
  return <CheckroomIcon />;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#ff9800';
  if (score >= 40) return '#ffc107';
  return '#f44336';
};

export default function GroomingRecommendationPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Profile state
  const [profile, setProfile] = useState<any>({
    skincare: {},
    haircare: {},
    outfit: {},
    gender: '',
    age: 0,
    currentSeason: '',
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Recommendation results
  const [skinResult, setSkinResult] = useState<SkinAnalysisResult | null>(null);
  const [hairResult, setHairResult] = useState<HairAnalysisResult | null>(null);
  const [outfitResult, setOutfitResult] = useState<OutfitAnalysisResult | null>(null);

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Profile dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile + latest results on mount
  useEffect(() => {
    loadProfile();
    loadLatestResults();
  }, []);

  const loadLatestResults = async () => {
    try {
      const [skinRes, hairRes, outfitRes] = await Promise.allSettled([
        groomingApi.getLatestByType('skincare', USER_ID),
        groomingApi.getLatestByType('haircare', USER_ID),
        groomingApi.getLatestByType('outfit', USER_ID),
      ]);
      if (skinRes.status === 'fulfilled') {
        const item = skinRes.value.data?.data || skinRes.value.data;
        if (item && item.analysisResult) {
          setSkinResult({
            skinScore: item.analysisResult?.skinScore || 0,
            skinType: item.analysisResult?.skinType || '',
            concerns: item.analysisResult?.concerns || [],
            detailedAnalysis: item.analysisResult?.detailedAnalysis || '',
            routine: item.routine || [],
            tips: item.tips || [],
            seasonalAdvice: item.seasonalAdvice || '',
          });
        }
      }
      if (hairRes.status === 'fulfilled') {
        const item = hairRes.value.data?.data || hairRes.value.data;
        if (item && item.analysisResult) {
          setHairResult({
            hairType: item.analysisResult?.hairType || '',
            faceShape: item.analysisResult?.faceShape || '',
            analysis: item.analysisResult?.analysis || '',
            haircutSuggestions: item.analysisResult?.haircutSuggestions || [],
            beardCare: item.analysisResult?.beardCare || [],
            products: item.products || [],
            stylingTips: item.analysisResult?.stylingTips || [],
            tips: item.tips || [],
          });
        }
      }
      if (outfitRes.status === 'fulfilled') {
        const item = outfitRes.value.data?.data || outfitRes.value.data;
        if (item && item.analysisResult) {
          setOutfitResult({
            analysis: item.analysisResult?.analysis || '',
            bodyType: item.analysisResult?.bodyType || '',
            colorPalette: item.analysisResult?.colorPalette || [],
            outfits: item.outfits || [],
            capsuleWardrobe: item.analysisResult?.capsuleWardrobe || [],
            accessoryTips: item.analysisResult?.accessoryTips || [],
            tips: item.tips || [],
            sustainableTips: item.analysisResult?.sustainableTips || [],
          });
        }
      }
    } catch (e) { errorLogger.warn('Failed to load latest results', 'GroomingRecommendation', { meta: { error: String(e) } }); }
  };

  const loadProfile = async () => {
    try {
      const res = await groomingApi.getProfile(USER_ID);
      const data = res.data?.data || res.data;
      if (data) {
        setProfile({
          skincare: data.skincare || {},
          haircare: data.haircare || {},
          outfit: data.outfit || {},
          gender: data.gender || '',
          age: data.age || 0,
          currentSeason: data.currentSeason || '',
        });
      }
      setProfileLoaded(true);
    } catch (e) {
      errorLogger.warn('Failed to load profile', 'GroomingRecommendation', { meta: { error: String(e) } });
      setProfileLoaded(true);
    }
  };

  const saveProfile = async (updatedProfile: any) => {
    try {
      await groomingApi.saveProfile(updatedProfile, USER_ID);
      setProfile(updatedProfile);
      setProfileDialogOpen(false);
      setSaveSuccess('Profile saved successfully!');
    } catch (e) {
      errorLogger.error('Failed to save profile', 'GroomingRecommendation', { meta: { error: String(e) } });
      setError('Failed to save profile');
    }
  };

  const loadHistory = async (type: string) => {
    try {
      const res = await groomingApi.getRecommendations({ type }, USER_ID);
      const data = res.data?.data || res.data || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      errorLogger.warn('Failed to load history', 'GroomingRecommendation', { meta: { error: String(e) } });
      setHistory([]);
    }
  };

  // AI Generation (from profile)
  const generateFromProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const merged = { ...profile, ...getCurrentTabProfile(), season: profile.currentSeason };
      let result: any;
      let type: string;

      if (tab === 0) {
        result = await generateSkincareRoutine(merged);
        setSkinResult(result);
        type = 'skincare';
      } else if (tab === 1) {
        result = await generateHaircareRoutine(merged);
        setHairResult(result);
        type = 'haircare';
      } else {
        result = await generateOutfitRecommendations(merged);
        setOutfitResult(result);
        type = 'outfit';
      }

      // Save to backend
      await groomingApi.saveRecommendation({
        type,
        title: `AI ${type} Recommendation`,
        ...(type === 'skincare' ? { routine: result.routine, products: [], tips: result.tips, seasonalAdvice: result.seasonalAdvice, analysisResult: { skinScore: result.skinScore, skinType: result.skinType, concerns: result.concerns, detailedAnalysis: result.detailedAnalysis } } : {}),
        ...(type === 'haircare' ? { routine: [], products: result.products, tips: result.tips, analysisResult: { hairType: result.hairType, faceShape: result.faceShape, analysis: result.analysis, haircutSuggestions: result.haircutSuggestions, beardCare: result.beardCare, stylingTips: result.stylingTips } } : {}),
        ...(type === 'outfit' ? { outfits: result.outfits, products: [], tips: result.tips, analysisResult: { analysis: result.analysis, bodyType: result.bodyType, colorPalette: result.colorPalette, capsuleWardrobe: result.capsuleWardrobe, accessoryTips: result.accessoryTips, sustainableTips: result.sustainableTips } } : {}),
      }, USER_ID);
      setSaveSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} recommendation generated & saved!`);
    } catch (e: any) {
      errorLogger.error(e?.message || 'AI generation failed', 'GroomingRecommendation', { stack: e?.stack, meta: { action: 'generateFromProfile' } });
      setError(e?.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  // AI Analysis (from photo)
  const analyzeFromPhoto = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const merged = { ...profile, ...getCurrentTabProfile(), season: profile.currentSeason };
      let result: any;
      let type: string;

      if (tab === 0) {
        result = await analyzeSkinImage(file, merged);
        setSkinResult(result);
        type = 'skincare';
      } else if (tab === 1) {
        result = await analyzeHairImage(file, merged);
        setHairResult(result);
        type = 'haircare';
      } else {
        result = await analyzeOutfitImage(file, merged);
        setOutfitResult(result);
        type = 'outfit';
      }

      // Save to backend
      await groomingApi.saveRecommendation({
        type,
        title: `AI ${type} Analysis (Photo)`,
        ...(type === 'skincare' ? { routine: result.routine, tips: result.tips, seasonalAdvice: result.seasonalAdvice, analysisResult: { skinScore: result.skinScore, skinType: result.skinType, concerns: result.concerns, detailedAnalysis: result.detailedAnalysis } } : {}),
        ...(type === 'haircare' ? { products: result.products, tips: result.tips, analysisResult: { hairType: result.hairType, faceShape: result.faceShape, analysis: result.analysis, haircutSuggestions: result.haircutSuggestions, beardCare: result.beardCare, stylingTips: result.stylingTips } } : {}),
        ...(type === 'outfit' ? { outfits: result.outfits, tips: result.tips, analysisResult: { analysis: result.analysis, bodyType: result.bodyType, colorPalette: result.colorPalette, capsuleWardrobe: result.capsuleWardrobe, accessoryTips: result.accessoryTips, sustainableTips: result.sustainableTips } } : {}),
      }, USER_ID);
      setSaveSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} analysis saved!`);
    } catch (e: any) {
      errorLogger.error(e?.message || 'AI analysis failed', 'GroomingRecommendation', { stack: e?.stack, meta: { action: 'analyzeFromPhoto' } });
      setError(e?.message || 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeFromPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getCurrentTabProfile = () => {
    if (tab === 0) return profile.skincare || {};
    if (tab === 1) return profile.haircare || {};
    return profile.outfit || {};
  };

  const getTabType = () => ['skincare', 'haircare', 'outfit'][tab];
  const getTabColor = () => [COLORS.skincare, COLORS.haircare, COLORS.outfit][tab];

  const openProfileDialog = () => {
    const current = tab === 0 ? { ...profile.skincare } : tab === 1 ? { ...profile.haircare } : { ...profile.outfit };
    setEditingProfile({ ...current, gender: profile.gender, age: profile.age, currentSeason: profile.currentSeason });
    setProfileDialogOpen(true);
  };

  const handleProfileSave = () => {
    const { gender, age, currentSeason, ...tabProfile } = editingProfile;
    const updated = { ...profile, gender, age, currentSeason };
    if (tab === 0) updated.skincare = tabProfile;
    else if (tab === 1) updated.haircare = tabProfile;
    else updated.outfit = tabProfile;
    saveProfile(updated);
  };

  const toggleHistoryItem = async (id: string) => {
    try {
      await groomingApi.toggleSaved(id, USER_ID);
      loadHistory(getTabType());
    } catch (e) { errorLogger.warn('Failed to toggle saved', 'GroomingRecommendation', { meta: { error: String(e), id } }); }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await groomingApi.deleteRecommendation(id, USER_ID);
      loadHistory(getTabType());
    } catch (e) { errorLogger.warn('Failed to delete recommendation', 'GroomingRecommendation', { meta: { error: String(e), id } }); }
  };

  const loadHistoryItem = (item: any) => {
    const type = item.type;
    if (type === 'skincare') {
      setSkinResult({
        skinScore: item.analysisResult?.skinScore || 0,
        skinType: item.analysisResult?.skinType || '',
        concerns: item.analysisResult?.concerns || [],
        detailedAnalysis: item.analysisResult?.detailedAnalysis || '',
        routine: item.routine || [],
        tips: item.tips || [],
        seasonalAdvice: item.seasonalAdvice || '',
      });
      setTab(0);
    } else if (type === 'haircare') {
      setHairResult({
        hairType: item.analysisResult?.hairType || '',
        faceShape: item.analysisResult?.faceShape || '',
        analysis: item.analysisResult?.analysis || '',
        haircutSuggestions: item.analysisResult?.haircutSuggestions || [],
        beardCare: item.analysisResult?.beardCare || [],
        products: item.products || [],
        stylingTips: item.analysisResult?.stylingTips || [],
        tips: item.tips || [],
      });
      setTab(1);
    } else if (type === 'outfit') {
      setOutfitResult({
        analysis: item.analysisResult?.analysis || '',
        bodyType: item.analysisResult?.bodyType || '',
        colorPalette: item.analysisResult?.colorPalette || [],
        outfits: item.outfits || [],
        capsuleWardrobe: item.analysisResult?.capsuleWardrobe || [],
        accessoryTips: item.analysisResult?.accessoryTips || [],
        tips: item.tips || [],
        sustainableTips: item.analysisResult?.sustainableTips || [],
      });
      setTab(2);
    }
    setHistoryOpen(false);
  };

  // ═══════════ RENDER ═══════════════════════════════════

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SpaIcon sx={{ fontSize: 28, color: '#9c27b0' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Grooming Recommendations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HistoryIcon />}
            onClick={() => { setHistoryOpen(true); loadHistory(getTabType()); }}
            sx={{ textTransform: 'none' }}
          >
            History
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}
      >
        <Tab icon={<FaceIcon />} iconPosition="start" label="Skincare" />
        <Tab icon={<ContentCutIcon />} iconPosition="start" label="Haircare" />
        <Tab icon={<CheckroomIcon />} iconPosition="start" label="Outfit Styling" />
      </Tabs>

      {/* Profile Card + Actions */}
      {(() => {
        const hasProfile = profileLoaded && (
          (tab === 0 && profile.skincare?.skinType) ||
          (tab === 1 && profile.haircare?.hairType) ||
          (tab === 2 && profile.outfit?.bodyType)
        );
        const tabLabel = tab === 0 ? 'Skincare' : tab === 1 ? 'Haircare' : 'Outfit';
        const tabColor = getTabColor();
        return (
          <Paper
            variant="outlined"
            sx={{
              p: 0, mb: 3, borderRadius: 3, overflow: 'hidden',
              borderColor: `${tabColor}30`,
              background: hasProfile ? '#fff' : `linear-gradient(135deg, ${tabColor}08 0%, ${tabColor}03 100%)`,
            }}
          >
            {/* Profile status bar */}
            <Box
              sx={{
                px: 2.5, py: 1.5,
                display: 'flex', alignItems: 'center', gap: 1.5,
                background: `linear-gradient(90deg, ${tabColor}12 0%, transparent 100%)`,
                borderBottom: `1px solid ${tabColor}15`,
                cursor: 'pointer',
                '&:hover': { background: `linear-gradient(90deg, ${tabColor}18 0%, transparent 100%)` },
              }}
              onClick={openProfileDialog}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: hasProfile ? `${tabColor}20` : `${tabColor}10` }}>
                {hasProfile
                  ? <PersonIcon sx={{ color: tabColor, fontSize: 20 }} />
                  : <AddCircleOutlineIcon sx={{ color: tabColor, fontSize: 20 }} />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: hasProfile ? 'text.primary' : tabColor }}>
                  {hasProfile ? `${tabLabel} Profile` : `Create ${tabLabel} Profile`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {hasProfile
                    ? 'Click to edit your profile for better AI recommendations'
                    : 'Set up your profile to get personalized AI recommendations'}
                </Typography>
              </Box>
              {hasProfile && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {profile.gender && <Chip size="small" label={profile.gender} sx={{ bgcolor: `${tabColor}12`, color: tabColor, fontWeight: 600, fontSize: 11 }} />}
                  {profile.age > 0 && <Chip size="small" label={`Age ${profile.age}`} sx={{ bgcolor: `${tabColor}12`, color: tabColor, fontWeight: 600, fontSize: 11 }} />}
                  {profile.currentSeason && <Chip size="small" label={profile.currentSeason} sx={{ bgcolor: `${tabColor}12`, color: tabColor, fontSize: 11 }} />}
                  {tab === 0 && profile.skincare?.skinType && <Chip size="small" label={profile.skincare.skinType} sx={{ bgcolor: `${tabColor}12`, color: tabColor, fontWeight: 600, fontSize: 11 }} />}
                  {tab === 0 && (profile.skincare?.concerns || []).slice(0, 3).map((c: string) => <Chip key={c} size="small" label={c.replace('_', ' ')} sx={{ bgcolor: `${tabColor}08`, color: tabColor, fontSize: 11 }} />)}
                  {tab === 1 && profile.haircare?.hairType && <Chip size="small" label={profile.haircare.hairType} sx={{ bgcolor: `${tabColor}12`, color: tabColor, fontWeight: 600, fontSize: 11 }} />}
                  {tab === 1 && profile.haircare?.faceShape && <Chip size="small" label={profile.haircare.faceShape} sx={{ bgcolor: `${tabColor}08`, color: tabColor, fontSize: 11 }} />}
                  {tab === 2 && profile.outfit?.bodyType && <Chip size="small" label={profile.outfit.bodyType} sx={{ bgcolor: `${tabColor}12`, color: tabColor, fontWeight: 600, fontSize: 11 }} />}
                  {tab === 2 && (profile.outfit?.stylePreferences || []).slice(0, 3).map((s: string) => <Chip key={s} size="small" label={s.replace('_', ' ')} sx={{ bgcolor: `${tabColor}08`, color: tabColor, fontSize: 11 }} />)}
                </Box>
              )}
              <IconButton size="small" sx={{ color: tabColor }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Action buttons */}
            <Box sx={{ px: 2.5, py: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={generateFromProfile}
                disabled={loading}
                sx={{ textTransform: 'none', bgcolor: tabColor, '&:hover': { bgcolor: tabColor, filter: 'brightness(0.9)' }, borderRadius: 2, px: 3 }}
              >
                {loading ? 'Analyzing...' : 'Generate from Profile'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                sx={{ textTransform: 'none', borderColor: tabColor, color: tabColor, borderRadius: 2 }}
              >
                {tab === 0 ? 'Analyze Skin Photo' : tab === 1 ? 'Analyze Hair Photo' : 'Analyze Body/Style Photo'}
              </Button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
            </Box>
          </Paper>
        );
      })()}

      {/* Results */}
      {tab === 0 && <SkincareResults result={skinResult} color={COLORS.skincare} />}
      {tab === 1 && <HaircareResults result={hairResult} color={COLORS.haircare} />}
      {tab === 2 && <OutfitResults result={outfitResult} color={COLORS.outfit} />}

      {/* Empty State */}
      {tab === 0 && !skinResult && !loading && <EmptyState type="skincare" color={COLORS.skincare} icon={<FaceIcon />} />}
      {tab === 1 && !hairResult && !loading && <EmptyState type="haircare" color={COLORS.haircare} icon={<ContentCutIcon />} />}
      {tab === 2 && !outfitResult && !loading && <EmptyState type="outfit styling" color={COLORS.outfit} icon={<CheckroomIcon />} />}

      {/* Profile Edit Dialog */}
      <ProfileDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onSave={handleProfileSave}
        tab={tab}
        profile={editingProfile}
        setProfile={setEditingProfile}
      />

      {/* History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Recommendation History</DialogTitle>
        <DialogContent>
          {history.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No previous recommendations</Typography>
          ) : (
            history.map((item: any) => (
              <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 1, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => loadHistoryItem(item)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(item.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleHistoryItem(item._id); }}>
                      {item.isSaved ? <BookmarkIcon fontSize="small" color="primary" /> : <BookmarkBorderIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item._id); }}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setHistoryOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Success Snackbar */}
      <Snackbar
        open={!!saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess('')}
        message={saveSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ═══════════ SKINCARE RESULTS ════════════════════════════

function SkincareResults({ result, color }: { result: SkinAnalysisResult | null; color: string }) {
  if (!result) return null;

  return (
    <Box>
      {/* Hero Banner with Score */}
      <Paper
        sx={{
          p: 0, mb: 3, borderRadius: 3, overflow: 'hidden',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 50%, #fff 100%)`,
          border: `1px solid ${color}20`,
        }}
      >
        <Grid container>
          <Grid item xs={12} md={4} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: { md: `1px solid ${color}15` } }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress variant="determinate" value={100} size={130} thickness={4} sx={{ color: '#e0e0e0', position: 'absolute' }} />
              <CircularProgress variant="determinate" value={result.skinScore} size={130} thickness={4} sx={{ color: getScoreColor(result.skinScore) }} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: getScoreColor(result.skinScore), lineHeight: 1 }}>{result.skinScore}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}>SKIN SCORE</Typography>
              </Box>
            </Box>
            <Chip
              icon={<FaceIcon />}
              label={result.skinType}
              sx={{ bgcolor: `${color}15`, color, fontWeight: 700, fontSize: 14, py: 2.5, px: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={8} sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color, fontSize: 20 }} /> Skin Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>{result.detailedAnalysis}</Typography>
            {/* Concern badges with icons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {result.concerns.map((concern) => (
                <Chip
                  key={concern}
                  icon={React.cloneElement(getConcernIcon(concern), { sx: { fontSize: 16 } })}
                  label={concern.replace(/_/g, ' ')}
                  size="small"
                  sx={{
                    bgcolor: `${getConcernColor(concern)}15`,
                    color: getConcernColor(concern),
                    fontWeight: 600,
                    border: `1px solid ${getConcernColor(concern)}30`,
                    '& .MuiChip-icon': { color: getConcernColor(concern) },
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Routine Steps - Visual Timeline */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}15`, width: 32, height: 32 }}>
          <SpaIcon sx={{ color, fontSize: 18 }} />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Your Skincare Routine</Typography>
        <Chip size="small" label={`${(result.routine || []).length} steps`} sx={{ ml: 'auto', bgcolor: `${color}15`, color, fontWeight: 600 }} />
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(result.routine || []).map((step) => {
          const catColor = getCategoryColor(step.name);
          return (
            <Grid item xs={12} sm={6} md={4} key={step.step}>
              <Paper
                sx={{
                  p: 0, borderRadius: 3, overflow: 'hidden', height: '100%',
                  border: `1px solid ${catColor}30`,
                  transition: 'all 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${catColor}20`, borderColor: catColor },
                }}
              >
                {/* Step header bar */}
                <Box sx={{ background: `linear-gradient(135deg, ${catColor}20 0%, ${catColor}08 100%)`, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: catColor, width: 36, height: 36, fontSize: 14, fontWeight: 800 }}>
                    {step.step}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{step.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                      {(step.timeOfDay === 'morning' || step.timeOfDay === 'both') && (
                        <Chip icon={<WbSunnyIcon sx={{ fontSize: '14px !important' }} />} label="AM" size="small" sx={{ height: 20, fontSize: 10, bgcolor: '#fff3e0', color: '#e65100', '& .MuiChip-icon': { color: '#ff9800' } }} />
                      )}
                      {(step.timeOfDay === 'evening' || step.timeOfDay === 'both') && (
                        <Chip icon={<NightsStayIcon sx={{ fontSize: '14px !important' }} />} label="PM" size="small" sx={{ height: 20, fontSize: 10, bgcolor: '#e8eaf6', color: '#283593', '& .MuiChip-icon': { color: '#5c6bc0' } }} />
                      )}
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: `${catColor}15`, width: 32, height: 32 }}>
                    {React.cloneElement(getCategoryIcon(step.name), { sx: { fontSize: 18, color: catColor } })}
                  </Avatar>
                </Box>
                {/* Step body */}
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.5 }}>{step.description}</Typography>
                  {step.product && (
                    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 1.5, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <ShoppingBagIcon sx={{ fontSize: 14, color: catColor }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{step.product.name}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{step.product.brand} · {step.product.priceRange}</Typography>
                      {step.product.keyIngredients && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {step.product.keyIngredients.split(',').slice(0, 3).map((ing: string, k: number) => (
                            <Chip key={k} label={ing.trim()} size="small" sx={{ height: 18, fontSize: 9, bgcolor: `${catColor}10`, color: catColor }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                  <Chip size="small" label={step.frequency} sx={{ mt: 1, fontSize: 10, bgcolor: '#f5f5f5' }} />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Tips + Seasonal - Visual cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: `1px solid ${color}20` }}>
            <Box sx={{ background: `linear-gradient(135deg, #fff8e1 0%, #fff3e020 100%)`, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#fff3e0', width: 32, height: 32 }}>
                <TipsAndUpdatesIcon sx={{ color: '#ff8f00', fontSize: 18 }} />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Pro Tips</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {(result.tips || []).map((tip, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, '&:last-child': { mb: 0 } }}>
                  <Avatar sx={{ bgcolor: `${color}10`, width: 24, height: 24, fontSize: 12, fontWeight: 700, color, flexShrink: 0, mt: 0.2 }}>
                    {i + 1}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tip}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: `1px solid ${color}20` }}>
            <Box sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e920 100%)', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#e3f2fd', width: 32, height: 32 }}>
                <AcUnitIcon sx={{ color: '#1565c0', fontSize: 18 }} />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Seasonal Advice</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{result.seasonalAdvice}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// ═══════════ HAIRCARE RESULTS ════════════════════════════

function HaircareResults({ result, color }: { result: HairAnalysisResult | null; color: string }) {
  if (!result) return null;

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
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {result.hairType && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: `${color}10`, borderRadius: 3, px: 2, py: 1.5 }}>
                <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                  <WavesIcon sx={{ fontSize: 22 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hair Type</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{result.hairType}</Typography>
                </Box>
              </Box>
            )}
            {result.faceShape && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: `${color}10`, borderRadius: 3, px: 2, py: 1.5 }}>
                <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                  <FaceIcon sx={{ fontSize: 22 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Face Shape</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{result.faceShape}</Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{result.analysis}</Typography>
        </Box>
      </Paper>

      {/* Haircut Suggestions */}
      {(result.haircutSuggestions || []).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}15`, width: 32, height: 32 }}>
              <ContentCutIcon sx={{ color, fontSize: 18 }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Haircut Suggestions</Typography>
          </Box>
          <Grid container spacing={2}>
            {result.haircutSuggestions.map((cut, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper
                  sx={{
                    p: 0, borderRadius: 3, overflow: 'hidden', height: '100%',
                    border: `1px solid ${color}25`,
                    transition: 'all 0.25s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${color}15` },
                  }}
                >
                  <Box sx={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: color, width: 44, height: 44 }}>
                      <ContentCutIcon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15 }}>{cut.name}</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>{cut.description}</Typography>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                      label={cut.suitability}
                      size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, '& .MuiChip-icon': { color: '#4caf50' } }}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Beard Care */}
      {(result.beardCare || []).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}15`, width: 32, height: 32 }}>
              <FaceIcon sx={{ color, fontSize: 18 }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Beard Care Routine</Typography>
          </Box>
          <Grid container spacing={2}>
            {result.beardCare.map((care, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Paper
                  sx={{
                    p: 2, borderRadius: 3, height: '100%',
                    border: `1px solid ${color}25`,
                    transition: 'all 0.25s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 15px ${color}15` },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: `${color}12`, width: 36, height: 36, fontSize: 14, fontWeight: 800, color }}>{i + 1}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{care.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>{care.description}</Typography>
                      {care.product && (
                        <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 1.5, border: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                            <ShoppingBagIcon sx={{ fontSize: 14, color }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{care.product.name}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">{care.product.brand} · {care.product.priceRange}</Typography>
                        </Box>
                      )}
                      <Chip size="small" label={care.frequency} sx={{ mt: 1, fontSize: 10, bgcolor: '#f5f5f5' }} />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Products */}
      {(result.products || []).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}15`, width: 32, height: 32 }}>
              <LocalMallIcon sx={{ color, fontSize: 18 }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recommended Products</Typography>
          </Box>
          <Grid container spacing={2}>
            {result.products.map((prod, i) => {
              const catColor = getCategoryColor(prod.category || prod.name);
              return (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Paper
                    sx={{
                      p: 0, borderRadius: 3, overflow: 'hidden', height: '100%',
                      border: `1px solid ${catColor}25`,
                      transition: 'all 0.25s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 6px 20px ${catColor}15` },
                    }}
                  >
                    <Box sx={{ background: `linear-gradient(135deg, ${catColor}12 0%, ${catColor}04 100%)`, p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: catColor, width: 32, height: 32 }}>
                        {React.cloneElement(getCategoryIcon(prod.category || prod.name), { sx: { fontSize: 16, color: '#fff' } })}
                      </Avatar>
                      <Chip label={prod.category} size="small" sx={{ bgcolor: `${catColor}20`, color: catColor, fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{prod.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{prod.brand} · {prod.priceRange}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 12, lineHeight: 1.5 }}>{prod.description}</Typography>
                      {prod.keyIngredients && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {prod.keyIngredients.split(',').slice(0, 3).map((ing: string, k: number) => (
                            <Chip key={k} label={ing.trim()} size="small" sx={{ height: 20, fontSize: 9, bgcolor: `${catColor}10`, color: catColor }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Styling Tips + General Tips */}
      <Grid container spacing={2}>
        {(result.stylingTips || []).length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: `1px solid ${color}20` }}>
              <Box sx={{ background: `linear-gradient(135deg, ${color}10 0%, ${color}04 100%)`, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: `${color}20`, width: 32, height: 32 }}>
                  <ContentCutIcon sx={{ color, fontSize: 18 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Styling Tips</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {result.stylingTips.map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <Avatar sx={{ bgcolor: `${color}10`, width: 24, height: 24, fontSize: 12, fontWeight: 700, color, flexShrink: 0, mt: 0.2 }}>
                      {i + 1}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
        {(result.tips || []).length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: `1px solid ${color}20` }}>
              <Box sx={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fff3e005 100%)', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#fff3e0', width: 32, height: 32 }}>
                  <TipsAndUpdatesIcon sx={{ color: '#ff8f00', fontSize: 18 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>General Tips</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {result.tips.map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <StarIcon sx={{ fontSize: 16, color: '#ffa726', flexShrink: 0, mt: 0.3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

// ═══════════ OUTFIT RESULTS ═════════════════════════════

function OutfitResults({ result, color }: { result: OutfitAnalysisResult | null; color: string }) {
  const [selectedItem, setSelectedItem] = useState<{ type: string; name: string; color?: string; style?: string; description?: string; priceRange?: string; versatility?: string; occasion?: string; stylingTips?: string } | null>(null);

  if (!result) return null;

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
          <Grid item xs={12} md={7} sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color, fontSize: 20 }} /> Style Analysis
            </Typography>
            {result.bodyType && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: `${color}10`, borderRadius: 3, px: 2, py: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: color, width: 36, height: 36 }}>
                  <EmojiPeopleIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Body Type</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{result.bodyType}</Typography>
                </Box>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{result.analysis}</Typography>
          </Grid>
          <Grid item xs={12} md={5} sx={{ p: 3, borderLeft: { md: `1px solid ${color}15` } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PaletteIcon sx={{ color, fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Your Color Palette</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {(result.colorPalette || []).map((cp, i) => {
                const hex = resolveColor(cp.color);
                return (
                  <Box key={i} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 48, height: 48, borderRadius: '50%', bgcolor: hex,
                        border: '3px solid #fff',
                        boxShadow: `0 2px 8px ${hex}40`,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.15)' },
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 600, mt: 0.5, display: 'block', fontSize: 10 }}>{cp.color}</Typography>
                  </Box>
                );
              })}
            </Box>
            {(result.colorPalette || []).map((cp, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.8 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: resolveColor(cp.color), flexShrink: 0, mt: 0.5, border: '1px solid #e0e0e0' }} />
                <Typography variant="caption" color="text.secondary"><strong>{cp.color}</strong> — {cp.reason}</Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>

      {/* Outfit Combinations */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}15`, width: 32, height: 32 }}>
          <CheckroomIcon sx={{ color, fontSize: 18 }} />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Outfit Combinations</Typography>
        <Chip size="small" label={`${(result.outfits || []).length} looks`} sx={{ ml: 'auto', bgcolor: `${color}15`, color, fontWeight: 600 }} />
      </Box>
      {(result.outfits || []).map((outfit, i) => (
        <Accordion
          key={i}
          defaultExpanded={i === 0}
          sx={{
            mb: 1.5, border: '1px solid', borderColor: `${color}20`, borderRadius: '12px !important',
            overflow: 'hidden', '&:before': { display: 'none' }, '&.Mui-expanded': { mt: 0, mb: 1.5 },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ background: i === 0 ? `linear-gradient(135deg, ${color}08 0%, transparent 100%)` : undefined }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: color, width: 36, height: 36, fontSize: 14, fontWeight: 800 }}>{i + 1}</Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{outfit.occasion}</Typography>
                <Typography variant="caption" color="text.secondary">{(outfit.items || []).length} pieces</Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              {(outfit.items || []).map((item, j) => {
                const itemColor = resolveColor(item.color || '');
                return (
                  <Grid item xs={12} sm={6} md={4} key={j}>
                    <Paper
                      onClick={() => setSelectedItem({ ...item, occasion: outfit.occasion, stylingTips: outfit.stylingTips })}
                      sx={{
                        p: 0, borderRadius: 2.5, overflow: 'hidden', height: '100%',
                        border: `1px solid ${color}15`,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        '&:hover': { borderColor: color, boxShadow: `0 6px 20px ${color}15`, transform: 'translateY(-3px)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8f9fa' }}>
                        <Avatar sx={{ bgcolor: `${color}15`, width: 36, height: 36 }}>
                          {React.cloneElement(getClothingIcon(item.type || item.name), { sx: { fontSize: 18, color } })}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Chip label={item.type} size="small" sx={{ height: 20, fontSize: 10, bgcolor: `${color}12`, color, fontWeight: 600 }} />
                        </Box>
                        {item.color && (
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: itemColor, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        )}
                      </Box>
                      <Box sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.color} · {item.style}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <Typography variant="caption" sx={{ color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            View details <ArrowForwardIcon sx={{ fontSize: 12 }} />
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
            {outfit.stylingTips && (
              <Box sx={{ display: 'flex', gap: 1, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2, mb: 0.5 }}>
                <StarIcon sx={{ fontSize: 16, color: '#ffa726', flexShrink: 0, mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary"><strong>Styling:</strong> {outfit.stylingTips}</Typography>
              </Box>
            )}
            {outfit.colorPaletteReason && (
              <Box sx={{ display: 'flex', gap: 1, p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                <PaletteIcon sx={{ fontSize: 16, color, flexShrink: 0, mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary"><strong>Colors:</strong> {outfit.colorPaletteReason}</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Capsule Wardrobe */}
      {(result.capsuleWardrobe || []).length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}15`, width: 32, height: 32 }}>
              <ShoppingBagIcon sx={{ color, fontSize: 18 }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Capsule Wardrobe</Typography>
            <Chip size="small" label={`${result.capsuleWardrobe.length} essentials`} sx={{ ml: 'auto', bgcolor: `${color}15`, color, fontWeight: 600 }} />
          </Box>
          <Grid container spacing={1.5}>
            {result.capsuleWardrobe.map((item, i) => {
              const itemHex = resolveColor(item.color || '');
              return (
                <Grid item xs={6} sm={4} md={3} key={i}>
                  <Paper
                    onClick={() => setSelectedItem({ type: item.type, name: item.name, color: item.color, versatility: item.versatility })}
                    sx={{
                      p: 2, borderRadius: 3, textAlign: 'center', height: '100%',
                      border: `1px solid ${color}20`,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${color}12`, borderColor: color },
                    }}
                  >
                    <Avatar sx={{ bgcolor: `${color}10`, width: 48, height: 48, mx: 'auto', mb: 1 }}>
                      {React.cloneElement(getClothingIcon(item.type || item.name), { sx: { fontSize: 24, color } })}
                    </Avatar>
                    <Chip label={item.type} size="small" sx={{ mb: 0.5, bgcolor: `${color}12`, color, fontWeight: 600, fontSize: 10 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: itemHex, border: '1px solid #e0e0e0' }} />
                      <Typography variant="caption" color="text.secondary">{item.color}</Typography>
                    </Box>
                    {item.versatility && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: 10, fontStyle: 'italic' }}>{item.versatility}</Typography>}
                    <Typography variant="caption" sx={{ color, fontWeight: 600, mt: 0.5, display: 'block', fontSize: 10 }}>Tap to view</Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Tips Sections */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {(result.accessoryTips || []).length > 0 && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: `1px solid ${color}20` }}>
              <Box sx={{ background: `linear-gradient(135deg, #fff3e0 0%, transparent 100%)`, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#ffe0b2', width: 32, height: 32 }}>
                  <WatchIcon sx={{ color: '#e65100', fontSize: 18 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Accessories</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {result.accessoryTips.map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <DiamondIcon sx={{ fontSize: 14, color: '#ff8f00', flexShrink: 0, mt: 0.3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
        {(result.tips || []).length > 0 && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: `1px solid ${color}20` }}>
              <Box sx={{ background: `linear-gradient(135deg, #f3e5f5 0%, transparent 100%)`, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#e1bee7', width: 32, height: 32 }}>
                  <StarIcon sx={{ color: '#7b1fa2', fontSize: 18 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Style Tips</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {result.tips.map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <ArrowForwardIcon sx={{ fontSize: 14, color, flexShrink: 0, mt: 0.3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
        {(result.sustainableTips || []).length > 0 && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: `1px solid ${color}20` }}>
              <Box sx={{ background: 'linear-gradient(135deg, #e8f5e9 0%, transparent 100%)', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#c8e6c9', width: 32, height: 32 }}>
                  <RecyclingIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Sustainable Fashion</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {result.sustainableTips.map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <LocalFloristIcon sx={{ fontSize: 14, color: '#4caf50', flexShrink: 0, mt: 0.3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* ── Item Detail Dialog ─────────────────────────────────── */}
      <Dialog
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {selectedItem && (() => {
          const itemHex = resolveColor(selectedItem.color || '');
          return (
            <>
              {/* Gradient header */}
              <Box sx={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`, p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: color, width: 64, height: 64 }}>
                  {React.cloneElement(getClothingIcon(selectedItem.type || selectedItem.name), { sx: { fontSize: 32, color: '#fff' } })}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Chip label={selectedItem.type} size="small" sx={{ bgcolor: `${color}25`, color, fontWeight: 700, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedItem.name}</Typography>
                </Box>
                <IconButton onClick={() => setSelectedItem(null)} size="small">✕</IconButton>
              </Box>
              <DialogContent sx={{ p: 3 }}>
                {/* Color + Style row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  {selectedItem.color && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f8f9fa', borderRadius: 3, px: 2, py: 1.5, flex: 1, minWidth: 140 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: itemHex, border: '3px solid #fff', boxShadow: `0 2px 10px ${itemHex}50` }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Color</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedItem.color}</Typography>
                      </Box>
                    </Box>
                  )}
                  {selectedItem.style && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f8f9fa', borderRadius: 3, px: 2, py: 1.5, flex: 1, minWidth: 140 }}>
                      <Avatar sx={{ bgcolor: `${color}15`, width: 40, height: 40 }}>
                        <CheckroomIcon sx={{ color, fontSize: 22 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Style</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedItem.style}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Description */}
                {selectedItem.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AutoAwesomeIcon sx={{ fontSize: 16, color }} /> Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, bgcolor: '#fafafa', borderRadius: 2, p: 2, border: '1px solid #f0f0f0' }}>
                      {selectedItem.description}
                    </Typography>
                  </Box>
                )}

                {/* Price Range */}
                {selectedItem.priceRange && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, bgcolor: '#e8f5e9', borderRadius: 2, p: 2 }}>
                    <Avatar sx={{ bgcolor: '#c8e6c9', width: 36, height: 36 }}>
                      <LocalMallIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Price Range</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2e7d32' }}>{selectedItem.priceRange}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Versatility (capsule wardrobe items) */}
                {selectedItem.versatility && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, bgcolor: `${color}08`, borderRadius: 2, p: 2 }}>
                    <Avatar sx={{ bgcolor: `${color}15`, width: 36, height: 36 }}>
                      <StarIcon sx={{ color, fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Versatility</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedItem.versatility}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Occasion context */}
                {selectedItem.occasion && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckroomIcon sx={{ fontSize: 16, color }} /> Occasion
                    </Typography>
                    <Chip label={selectedItem.occasion} sx={{ bgcolor: `${color}12`, color, fontWeight: 600 }} />
                  </Box>
                )}

                {/* Styling tip for this outfit */}
                {selectedItem.stylingTips && (
                  <Box sx={{ bgcolor: '#fff8e1', borderRadius: 2, p: 2, display: 'flex', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#fff3e0', width: 32, height: 32, flexShrink: 0 }}>
                      <TipsAndUpdatesIcon sx={{ color: '#ff8f00', fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#e65100', textTransform: 'uppercase' }}>Styling Tip</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{selectedItem.stylingTips}</Typography>
                    </Box>
                  </Box>
                )}
              </DialogContent>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}

// ═══════════ EMPTY STATE ═════════════════════════════════

function EmptyState({ type, color, icon }: { type: string; color: string; icon: React.ReactElement }) {
  return (
    <Paper
      sx={{
        p: 5, borderRadius: 4, textAlign: 'center',
        background: `linear-gradient(180deg, ${color}08 0%, #fff 60%)`,
        border: `2px dashed ${color}30`,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        {/* Decorative ring */}
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: `3px dashed ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Avatar sx={{ bgcolor: `${color}12`, width: 72, height: 72 }}>
            {React.cloneElement(icon, { sx: { fontSize: 36, color } })}
          </Avatar>
        </Box>
        {/* Small floating icons */}
        <Avatar sx={{ bgcolor: '#fff3e0', width: 28, height: 28, position: 'absolute', top: -4, right: -8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <AutoAwesomeIcon sx={{ fontSize: 14, color: '#ff8f00' }} />
        </Avatar>
        <Avatar sx={{ bgcolor: '#e8f5e9', width: 24, height: 24, position: 'absolute', bottom: 0, left: -6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <StarIcon sx={{ fontSize: 12, color: '#4caf50' }} />
        </Avatar>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        No {type} recommendations yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
        Fill in your profile and click "Generate from Profile" or upload a photo for AI-powered analysis
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Chip icon={<UploadIcon sx={{ fontSize: '16px !important' }} />} label="Upload Photo" variant="outlined" sx={{ borderColor: `${color}40`, color }} />
        <Chip icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />} label="AI Generate" variant="outlined" sx={{ borderColor: `${color}40`, color }} />
      </Box>
    </Paper>
  );
}

// ═══════════ PROFILE DIALOG ═════════════════════════════

function ProfileDialog({
  open,
  onClose,
  onSave,
  tab,
  profile,
  setProfile,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  tab: number;
  profile: any;
  setProfile: (p: any) => void;
}) {
  const update = (key: string, value: any) => setProfile({ ...profile, [key]: value });

  const toggleArrayItem = (key: string, item: string) => {
    const arr = profile[key] || [];
    setProfile({ ...profile, [key]: arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item] });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit {tab === 0 ? 'Skincare' : tab === 1 ? 'Haircare' : 'Outfit'} Profile
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Common fields */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select value={profile.gender || ''} label="Gender" onChange={(e) => update('gender', e.target.value)}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="non-binary">Non-binary</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="Age" type="number" value={profile.age || ''} onChange={(e) => update('age', parseInt(e.target.value) || 0)} />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Season</InputLabel>
                <Select value={profile.currentSeason || ''} label="Season" onChange={(e) => update('currentSeason', e.target.value)}>
                  {SEASONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider />

          {/* TAB-SPECIFIC FIELDS */}
          {tab === 0 && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Skin Type</InputLabel>
                <Select value={profile.skinType || ''} label="Skin Type" onChange={(e) => update('skinType', e.target.value)}>
                  {SKIN_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Concerns</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {SKIN_CONCERNS.map((c) => (
                    <Chip
                      key={c}
                      size="small"
                      label={c.replace('_', ' ')}
                      onClick={() => toggleArrayItem('concerns', c)}
                      variant={(profile.concerns || []).includes(c) ? 'filled' : 'outlined'}
                      color={(profile.concerns || []).includes(c) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Sun Exposure</InputLabel>
                <Select value={profile.sunExposure || ''} label="Sun Exposure" onChange={(e) => update('sunExposure', e.target.value)}>
                  {SUN_EXPOSURES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Budget</InputLabel>
                <Select value={profile.budget || ''} label="Budget" onChange={(e) => update('budget', e.target.value)}>
                  {BUDGETS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Checkbox checked={profile.veganOnly || false} onChange={(e) => update('veganOnly', e.target.checked)} />}
                label="Vegan products only"
              />

              <TextField fullWidth size="small" label="Allergies (comma separated)" value={(profile.allergies || []).join(', ')} onChange={(e) => update('allergies', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
              <TextField fullWidth size="small" label="Current Routine" multiline rows={2} value={profile.currentRoutine || ''} onChange={(e) => update('currentRoutine', e.target.value)} />
            </>
          )}

          {tab === 1 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Hair Type</InputLabel>
                    <Select value={profile.hairType || ''} label="Hair Type" onChange={(e) => update('hairType', e.target.value)}>
                      {HAIR_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Face Shape</InputLabel>
                    <Select value={profile.faceShape || ''} label="Face Shape" onChange={(e) => update('faceShape', e.target.value)}>
                      {FACE_SHAPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <FormControlLabel
                control={<Checkbox checked={profile.hasFacialHair || false} onChange={(e) => update('hasFacialHair', e.target.checked)} />}
                label="Has facial hair"
              />

              {profile.hasFacialHair && (
                <TextField fullWidth size="small" label="Facial Hair Style" value={profile.facialHairStyle || ''} onChange={(e) => update('facialHairStyle', e.target.value)} placeholder="e.g., full beard, goatee, stubble" />
              )}

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Hair Concerns</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {HAIR_CONCERNS.map((c) => (
                    <Chip
                      key={c}
                      size="small"
                      label={c.replace('_', ' ')}
                      onClick={() => toggleArrayItem('hairConcerns', c)}
                      variant={(profile.hairConcerns || []).includes(c) ? 'filled' : 'outlined'}
                      color={(profile.hairConcerns || []).includes(c) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Styling Preference</InputLabel>
                <Select value={profile.stylingPreference || ''} label="Styling Preference" onChange={(e) => update('stylingPreference', e.target.value)}>
                  {STYLING_PREFS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField fullWidth size="small" label="Current Products" multiline rows={2} value={profile.currentProducts || ''} onChange={(e) => update('currentProducts', e.target.value)} placeholder="List products you currently use" />
            </>
          )}

          {tab === 2 && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Body Type</InputLabel>
                <Select value={profile.bodyType || ''} label="Body Type" onChange={(e) => update('bodyType', e.target.value)}>
                  {BODY_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Style Preferences</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {STYLE_PREFS.map((s) => (
                    <Chip
                      key={s}
                      size="small"
                      label={s.replace('_', ' ')}
                      onClick={() => toggleArrayItem('stylePreferences', s)}
                      variant={(profile.stylePreferences || []).includes(s) ? 'filled' : 'outlined'}
                      color={(profile.stylePreferences || []).includes(s) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Occasions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {OCCASIONS.map((o) => (
                    <Chip
                      key={o}
                      size="small"
                      label={o}
                      onClick={() => toggleArrayItem('occasions', o)}
                      variant={(profile.occasions || []).includes(o) ? 'filled' : 'outlined'}
                      color={(profile.occasions || []).includes(o) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>

              <TextField fullWidth size="small" label="Favorite Colors (comma separated)" value={(profile.favoriteColors || []).join(', ')} onChange={(e) => update('favoriteColors', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Skin Tone</InputLabel>
                    <Select value={profile.skinTone || ''} label="Skin Tone" onChange={(e) => update('skinTone', e.target.value)}>
                      <MenuItem value="warm">Warm</MenuItem>
                      <MenuItem value="cool">Cool</MenuItem>
                      <MenuItem value="neutral">Neutral</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Height" value={profile.height || ''} onChange={(e) => update('height', e.target.value)} placeholder="e.g., 5'10" />
                </Grid>
              </Grid>

              <FormControl fullWidth size="small">
                <InputLabel>Budget</InputLabel>
                <Select value={profile.budget || ''} label="Budget" onChange={(e) => update('budget', e.target.value)}>
                  {BUDGETS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Checkbox checked={profile.sustainableOnly || false} onChange={(e) => update('sustainableOnly', e.target.checked)} />}
                label="Sustainable / eco-friendly options only"
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" onClick={onSave} sx={{ textTransform: 'none' }}>Save Profile</Button>
      </DialogActions>
    </Dialog>
  );
}
