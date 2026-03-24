import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  LinearProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { useAITutorStore, Textbook } from '@/store/aiTutorStore';

// Point to the static worker file in public/ — works in both dev and production
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

async function extractTextFromPdf(file: File): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item) => 'str' in item)
      .map((item) => (item as any).str as string)
      .join(' ');
    pages.push(text);
  }
  return { text: pages.join('\n\n'), pageCount: pdf.numPages };
}

interface Props {
  onSelectBook: (id: string) => void;
  selectedBookId: string | null;
}

export default function TextbooksTab({ onSelectBook, selectedBookId }: Props) {
  const { textbooks, addTextbook, removeTextbook } = useAITutorStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const { text, pageCount } = await extractTextFromPdf(file);
      const book: Textbook = {
        id: `book-${Date.now()}`,
        name: file.name,
        size: file.size,
        pageCount,
        extractedText: text,
        createdAt: new Date().toISOString(),
      };
      addTextbook(book);
      onSelectBook(book.id);
      toast.success(`"${book.name}" processed (${pageCount} pages)`);
    } catch (err: any) {
      toast.error('Failed to process PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeTextbook(bookId);
    if (selectedBookId === bookId) onSelectBook('');
    toast.success('Textbook removed');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        My Textbooks
      </Typography>
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
          borderColor: '#ccc',
          textAlign: 'center',
          cursor: isUploading ? 'default' : 'pointer',
          transition: 'all 0.2s',
          '&:hover': isUploading ? {} : { borderColor: '#999', bgcolor: '#fafafa' },
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
            <Typography variant="body1" sx={{ fontWeight: 500 }}>Upload Textbook</Typography>
            <Typography variant="caption" color="text.secondary">PDF up to 50MB</Typography>
          </>
        )}
      </Paper>

      {/* Book list */}
      {textbooks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <MenuBookIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No textbooks uploaded yet. Upload your first textbook to get started.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {textbooks.map((book) => (
            <Paper
              key={book.id}
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: selectedBookId === book.id ? '#f3e5f5' : 'transparent',
                borderColor: selectedBookId === book.id ? '#ce93d8' : 'divider',
                '&:hover': { bgcolor: selectedBookId === book.id ? '#f3e5f5' : '#fafafa' },
              }}
              onClick={() => onSelectBook(book.id)}
            >
              <PictureAsPdfIcon sx={{ fontSize: 28, color: '#e57373' }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{book.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {book.pageCount} pages · {formatSize(book.size)} · {new Date(book.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              {selectedBookId === book.id && (
                <Chip label="Active" size="small" color="secondary" variant="outlined" sx={{ fontSize: 11 }} />
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
          ))}
        </Box>
      )}
    </Box>
  );
}
