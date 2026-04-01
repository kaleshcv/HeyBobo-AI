import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  LinearProgress,
  Tooltip,
  Chip,
  Collapse,
  useTheme,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import { aiApi } from '@/lib/api';
import { useAITutorStore, Textbook } from '@/store/aiTutorStore';

interface Props {
  onSelectBook: (id: string) => void;
  selectedBookId: string | null;
}

export default function TextbooksTab({ onSelectBook, selectedBookId }: Props) {
  const dk = useTheme().palette.mode === 'dark';
  const { textbooks, setTextbooks, addTextbook, removeTextbook } = useAITutorStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with server on mount
  useEffect(() => {
    aiApi.getDocuments().then((res) => {
      const docs = res.data?.data ?? [];
      const mapped: Textbook[] = docs.map((d: any) => ({
        id: String(d._id ?? d.id),
        name: d.originalName ?? d.filename,
        size: d.size,
        pageCount: d.pageCount ?? 0,
        extractedText: d.extractedText ?? '',
        createdAt: d.createdAt ?? new Date().toISOString(),
      }));
      if (mapped.length) setTextbooks(mapped);
    }).catch(() => {});
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }
    setIsUploading(true);
    try {
      const res = await aiApi.uploadDocument(file);
      const raw = res.data?.data;
      // Unwrap double-wrapped response: { success, data: { success, data: {...} } }
      const d = (raw as any)?.data ?? raw;
      if (!d) throw new Error('Upload failed');
      const book: Textbook = {
        id: String(d.id),
        name: d.filename,
        size: d.size ?? file.size,
        pageCount: d.pageCount ?? 0,
        extractedText: d.extractedText ?? '',
        createdAt: d.createdAt ?? new Date().toISOString(),
      };
      addTextbook(book);
      onSelectBook(book.id);
      toast.success(`"${book.name}" uploaded (${book.pageCount} pages)`);
    } catch (err: any) {
      toast.error('Failed to upload PDF: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await aiApi.deleteDocument(bookId); } catch {}
    removeTextbook(bookId);
    if (selectedBookId === bookId) onSelectBook('');
    toast.success('Textbook removed');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2.5, md: 4 }, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#38bdf820', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MenuBookIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          My Textbooks
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload your university textbooks. The AI will study them and help you learn.
      </Typography>

      {/* Upload area */}
      <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleUpload} />
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 2,
          borderStyle: 'dashed',
          borderColor: dk ? 'rgba(255,255,255,0.15)' : '#ccc',
          textAlign: 'center',
          cursor: isUploading ? 'default' : 'pointer',
          transition: 'all 0.2s',
          '&:hover': isUploading ? {} : { borderColor: dk ? 'rgba(255,255,255,0.25)' : '#999', bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fafafa' },
          mb: 3,
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Box>
            <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />
            <Typography variant="body2" color="text.secondary">Uploading & processing PDF...</Typography>
          </Box>
        ) : (
          <>
            <UploadFileIcon sx={{ fontSize: 40, color: '#e57373', mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Upload Textbook</Typography>
            <Typography variant="caption" color="text.secondary">PDF up to 50MB</Typography>
          </>
        )}
      </Paper>

      {/* Book list */}
      {textbooks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <MenuBookIcon sx={{ fontSize: 48, color: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No textbooks uploaded yet. Upload your first textbook to get started.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {textbooks.map((book) => {
            const isSelected = selectedBookId === book.id;
            return (
              <Box key={book.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? '#4caf50' : 'divider',
                    bgcolor: isSelected ? (dk ? 'rgba(76,175,80,0.12)' : '#f1f8e9') : 'transparent',
                    boxShadow: isSelected ? '0 0 0 3px rgba(76,175,80,0.18)' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: isSelected ? '#4caf50' : (dk ? 'rgba(255,255,255,0.3)' : '#999'),
                      bgcolor: isSelected ? (dk ? 'rgba(76,175,80,0.15)' : '#f1f8e9') : (dk ? 'rgba(255,255,255,0.04)' : '#fafafa'),
                    },
                  }}
                  onClick={() => onSelectBook(book.id)}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 28, color: isSelected ? '#4caf50' : '#e57373', transition: 'color 0.2s' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: isSelected ? (dk ? '#81c784' : '#2e7d32') : 'text.primary', transition: 'color 0.2s' }}
                      noWrap
                    >
                      {book.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {book.pageCount} pages · {formatSize(book.size)} · {new Date(book.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {isSelected && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                      label="Active"
                      size="small"
                      sx={{
                        bgcolor: dk ? 'rgba(76,175,80,0.2)' : '#c8e6c9',
                        color: dk ? '#81c784' : '#2e7d32',
                        borderColor: '#4caf50',
                        fontWeight: 700,
                        fontSize: 11,
                        border: '1px solid',
                      }}
                    />
                  )}
                  <Tooltip title="Delete textbook">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(book.id, e)}
                      sx={{ color: 'text.secondary', opacity: 0.5, '&:hover': { opacity: 1, color: '#f44336' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Paper>

                {/* Selection note */}
                <Collapse in={isSelected} unmountOnExit>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      mt: 0.5,
                      ml: 1.5,
                      px: 1.5,
                      py: 0.6,
                      borderRadius: 1.5,
                      bgcolor: dk ? 'rgba(76,175,80,0.1)' : '#f1f8e9',
                      border: '1px solid',
                      borderColor: dk ? 'rgba(76,175,80,0.25)' : '#a5d6a7',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 14, color: '#4caf50' }} />
                    <Typography variant="caption" sx={{ color: dk ? '#81c784' : '#2e7d32', fontWeight: 600 }}>
                      This textbook is selected — AI Tutor will answer questions based on this book.
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
