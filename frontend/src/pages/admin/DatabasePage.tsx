import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityIcon from '@mui/icons-material/Visibility';
import toast from 'react-hot-toast';
import { dbBrowserApi } from '@/lib/api';
import { AnimatedPage } from '@/components/animations';

interface Collection {
  name: string;
  count: number;
}

interface DocumentViewDialog {
  open: boolean;
  doc: any;
}

// Render a cell value compactly
function CellValue({ value }: { value: any }) {
  if (value === null || value === undefined) return <span style={{ color: '#aaa', fontStyle: 'italic' }}>null</span>;
  if (typeof value === 'boolean') return <Chip label={String(value)} size="small" color={value ? 'success' : 'default'} sx={{ height: 20, fontSize: 11 }} />;
  if (typeof value === 'number') return <span>{value}</span>;
  if (typeof value === 'object') {
    if (value.$oid) return <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{value.$oid}</span>;
    if (value.$date) return <span>{new Date(value.$date).toLocaleDateString()}</span>;
    if (Array.isArray(value)) return <Chip label={`Array[${value.length}]`} size="small" sx={{ height: 20, fontSize: 11 }} />;
    return <Chip label="Object" size="small" sx={{ height: 20, fontSize: 11 }} />;
  }
  const str = String(value);
  if (str.length > 60) return <Tooltip title={str}><span>{str.slice(0, 60)}…</span></Tooltip>;
  // Format ISO dates
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    try {
      return <span>{new Date(str).toLocaleString()}</span>;
    } catch { /* fall through */ }
  }
  return <span>{str}</span>;
}

// Pick the most interesting columns to show (max 8)
function pickColumns(docs: any[]): string[] {
  if (!docs.length) return [];
  const allKeys = new Set<string>();
  docs.slice(0, 5).forEach((d) => Object.keys(d).forEach((k) => allKeys.add(k)));
  const priority = ['_id', 'name', 'title', 'email', 'topic', 'role', 'status', 'userId', 'textbookId', 'score', 'total', 'createdAt', 'updatedAt'];
  const ordered: string[] = [];
  for (const k of priority) {
    if (allKeys.has(k)) ordered.push(k);
  }
  allKeys.forEach((k) => {
    if (!ordered.includes(k)) ordered.push(k);
  });
  return ordered.slice(0, 8);
}

export default function DatabasePage() {
  const dk = useTheme().palette.mode === 'dark';
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [_pages, setPages] = useState(1);
  const [page, setPage] = useState(0); // MUI is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; preview: string } | null>(null);
  const [docDialog, setDocDialog] = useState<DocumentViewDialog>({ open: false, doc: null });
  const [collectionSearch, setCollectionSearch] = useState('');

  const loadCollections = async () => {
    setLoadingCollections(true);
    setCollectionsError(null);
    try {
      const res = await dbBrowserApi.listCollections();
      // TransformInterceptor wraps: { success, data: <controller return>, message }
      // Controller now returns the array directly, so res.data.data = the array
      const body = res.data as any;
      const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      setCollections(list);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      const detail = status ? `${status}: ${msg}` : msg;
      setCollectionsError(detail);
      toast.error(`Failed to load collections (${detail})`);
    } finally {
      setLoadingCollections(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const loadDocs = useCallback(async () => {
    if (!selectedCollection) return;
    setLoadingDocs(true);
    try {
      const res = await dbBrowserApi.queryCollection(selectedCollection, {
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      // TransformInterceptor wraps: { success, data: { data, total, page, limit, pages }, message }
      const body = res.data as any;
      const inner = body?.data || body || {};
      const data = Array.isArray(inner?.data) ? inner.data : Array.isArray(inner) ? inner : [];
      setDocs(data);
      setTotal(inner?.total || 0);
      setPages(inner?.pages || 1);
      setColumns(pickColumns(data));
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  }, [selectedCollection, page, rowsPerPage, search]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleCollectionClick = (name: string) => {
    setSelectedCollection(name);
    setPage(0);
    setSearch('');
    setSearchInput('');
    setDocs([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog || !selectedCollection) return;
    try {
      await dbBrowserApi.deleteDocument(selectedCollection, deleteDialog.id);
      toast.success('Document deleted');
      setDeleteDialog(null);
      loadDocs();
      loadCollections();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const getDocId = (doc: any): string => {
    if (doc._id?.$oid) return doc._id.$oid;
    if (typeof doc._id === 'string') return doc._id;
    if (doc._id?.toString) return doc._id.toString();
    return '';
  };

  const filteredCollections = (Array.isArray(collections) ? collections : []).filter((c) =>
    c.name.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  return (
    <AnimatedPage>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0 }}>
        {/* Sidebar: Collections list */}
        <Paper
        elevation={0}
        variant="outlined"
        sx={{
          width: 240,
          flexShrink: 0,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          mr: 2,
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <StorageIcon sx={{ fontSize: 18, color: '#7c4dff' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Collections</Typography>
            <IconButton size="small" onClick={loadCollections} sx={{ ml: 'auto' }}>
              <RefreshIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <TextField
            size="small"
            fullWidth
            placeholder="Filter…"
            value={collectionSearch}
            onChange={(e) => setCollectionSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14 }} /></InputAdornment>,
            }}
            sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
          />
        </Box>

        {loadingCollections ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : collectionsError ? (
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" color="error" sx={{ display: 'block', wordBreak: 'break-all', mb: 1 }}>
              Error: {collectionsError}
            </Typography>
            <Button size="small" variant="outlined" onClick={loadCollections} sx={{ textTransform: 'none', fontSize: 11 }}>
              Retry
            </Button>
          </Box>
        ) : (
          <List dense sx={{ overflow: 'auto', flex: 1, py: 0.5 }}>
            {filteredCollections.map((col) => (
              <ListItemButton
                key={col.name}
                selected={selectedCollection === col.name}
                onClick={() => handleCollectionClick(col.name)}
                sx={{
                  borderRadius: 1, mx: 0.5, mb: 0.25, py: 0.5,
                  '&.Mui-selected': { bgcolor: '#7c4dff18', '&:hover': { bgcolor: '#7c4dff28' } },
                }}
              >
                <ListItemText
                  primary={col.name}
                  primaryTypographyProps={{ fontSize: 12, fontWeight: selectedCollection === col.name ? 600 : 400, noWrap: true }}
                />
                <Chip
                  label={col.count.toLocaleString()}
                  size="small"
                  sx={{ height: 18, fontSize: 10, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#f0f0f0' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedCollection ? (
          <Paper
            variant="outlined"
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}
          >
            <StorageIcon sx={{ fontSize: 64, color: dk ? 'rgba(255,255,255,0.1)' : '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Select a collection</Typography>
            <Typography variant="body2" color="text.secondary">Choose from the left to browse documents</Typography>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Breadcrumbs sx={{ fontSize: 13 }}>
                <MuiLink underline="hover" color="text.secondary" sx={{ cursor: 'pointer', fontSize: 13 }} onClick={() => setSelectedCollection(null)}>
                  Collections
                </MuiLink>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#7c4dff' }}>{selectedCollection}</Typography>
              </Breadcrumbs>
              <Chip label={`${total.toLocaleString()} docs`} size="small" sx={{ height: 20, fontSize: 11 }} />
              <Box sx={{ flex: 1 }} />
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
                <TextField
                  size="small"
                  placeholder="Search…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14 }} /></InputAdornment>,
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>
                          <span style={{ fontSize: 12 }}>✕</span>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 220, '& .MuiInputBase-root': { fontSize: 12 } }}
                />
                <Button type="submit" size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: 12, minWidth: 60 }}>
                  Search
                </Button>
              </form>
              <IconButton size="small" onClick={loadDocs}>
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {/* Table */}
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              {loadingDocs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : docs.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography color="text.secondary" variant="body2">No documents found</Typography>
                </Box>
              ) : (
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            bgcolor: dk ? '#1a2332' : '#f8f8f8',
                            color: 'text.secondary',
                            whiteSpace: 'nowrap',
                            py: 1,
                          }}
                        >
                          {col}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          fontWeight: 700, fontSize: 11, textTransform: 'uppercase',
                          bgcolor: dk ? '#1a2332' : '#f8f8f8', width: 80, py: 1,
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {docs.map((doc, i) => {
                      const docId = getDocId(doc);
                      return (
                        <TableRow
                          key={docId || i}
                          hover
                          sx={{ '& td': { fontSize: 12, py: 0.75, fontFamily: 'inherit' } }}
                        >
                          {columns.map((col) => (
                            <TableCell key={col} sx={{ maxWidth: 200, overflow: 'hidden' }}>
                              <CellValue value={doc[col]} />
                            </TableCell>
                          ))}
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.25 }}>
                              <Tooltip title="View document">
                                <IconButton size="small" onClick={() => setDocDialog({ open: true, doc })}>
                                  <VisibilityIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete document">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteDialog({
                                    open: true,
                                    id: docId,
                                    preview: doc.name || doc.title || doc.email || doc.topic || docId,
                                  })}
                                >
                                  <DeleteIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TableContainer>

            <Divider />
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50, 100]}
              sx={{ fontSize: 12, '& .MuiTablePagination-select': { fontSize: 12 }, '& .MuiTablePagination-displayedRows': { fontSize: 12 } }}
            />
          </Paper>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteDialog?.open} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13 }}>
            Are you sure you want to delete <strong>{deleteDialog?.preview}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} size="small">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" size="small">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Document view dialog */}
      <Dialog open={docDialog.open} onClose={() => setDocDialog({ open: false, doc: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Document</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              fontSize: 12,
              bgcolor: dk ? '#0d1b2a' : '#f8f8f8',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 500,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {JSON.stringify(docDialog.doc, null, 2)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocDialog({ open: false, doc: null })} size="small">Close</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </AnimatedPage>
  );
}
