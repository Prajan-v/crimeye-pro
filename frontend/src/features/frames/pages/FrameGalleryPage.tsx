import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Calendar, Camera, AlertTriangle, Filter, Download, Trash2, X, ChevronLeft, ChevronRight } from 'react-feather';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FilterBar = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ variant, theme }) => 
    variant === 'danger' ? theme.colors.status.error : 
    variant === 'primary' ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` :
    theme.colors.background.elevated};
  color: ${({ variant, theme }) => 
    variant ? theme.colors.background.primary : theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FrameCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const FrameImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.background.elevated};
`;

const FrameInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const FrameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ThreatBadge = styled.span<{ level: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ level, theme }) => {
    switch (level) {
      case 'high': return theme.colors.status.error;
      case 'medium': return theme.colors.status.warning;
      default: return theme.colors.status.success;
    }
  }};
  color: ${({ theme }) => theme.colors.background.primary};
`;

const FrameMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  
  svg {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

// Lightbox Modal
const Lightbox = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const LightboxContent = styled(motion.div)`
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LightboxImage = styled.img`
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const LightboxControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.elevated};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const LightboxInfo = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LightboxActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface DetectionFrame {
  id: string;
  camera_id: string;
  camera_name?: string;
  threat_level: string;
  timestamp: string;
  detections: any[];
  frame_url: string;
}

const FrameGalleryPage: React.FC = () => {
  const [frames, setFrames] = useState<DetectionFrame[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<DetectionFrame | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    camera: 'all',
    threatLevel: 'all',
    dateFrom: '',
    dateTo: '',
  });
  
  const { ref: loadMoreRef, inView } = useInView();
  
  // Load frames
  const loadFrames = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: String(reset ? 0 : page * 50),
        ...(filters.camera !== 'all' && { camera_id: filters.camera }),
        ...(filters.threatLevel !== 'all' && { threat_level: filters.threatLevel }),
        ...(filters.dateFrom && { date_from: filters.dateFrom }),
        ...(filters.dateTo && { date_to: filters.dateTo }),
      });
      
      const response = await axios.get(`http://localhost:8000/api/detections?${params}`);
      const newFrames = response.data.frames || [];
      
      if (reset) {
        setFrames(newFrames);
        setPage(0);
      } else {
        setFrames(prev => [...prev, ...newFrames]);
      }
      
      setHasMore(newFrames.length === 50);
      setPage(prev => reset ? 1 : prev + 1);
    } catch (error) {
      console.error('Error loading frames:', error);
      toast.error('Failed to load frames');
    } finally {
      setLoading(false);
    }
  }, [loading, page, filters]);
  
  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadFrames();
    }
  }, [inView, hasMore, loading, loadFrames]);
  
  // Initial load
  useEffect(() => {
    loadFrames(true);
  }, [filters]);
  
  const handleDelete = async (frameId: string) => {
    if (!window.confirm('Are you sure you want to delete this frame?')) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/detections/${frameId}`);
      setFrames(prev => prev.filter(f => f.id !== frameId));
      toast.success('Frame deleted successfully');
      if (selectedFrame?.id === frameId) {
        setSelectedFrame(null);
      }
    } catch (error) {
      console.error('Error deleting frame:', error);
      toast.error('Failed to delete frame');
    }
  };
  
  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/export/csv', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `detections_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Export failed');
    }
  };
  
  return (
    <PageContainer>
      <Header>
        <Title>Frame Gallery</Title>
        <ActionButtons>
          <Button onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </Button>
        </ActionButtons>
      </Header>
      
      <FilterBar
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FilterGroup>
          <Label>Camera</Label>
          <Select
            value={filters.camera}
            onChange={(e) => setFilters(prev => ({ ...prev, camera: e.target.value }))}
          >
            <option value="all">All Cameras</option>
            {/* Add camera options dynamically */}
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <Label>Threat Level</Label>
          <Select
            value={filters.threatLevel}
            onChange={(e) => setFilters(prev => ({ ...prev, threatLevel: e.target.value }))}
          >
            <option value="all">All Levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <Label>From Date</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
          />
        </FilterGroup>
        
        <FilterGroup>
          <Label>To Date</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
          />
        </FilterGroup>
      </FilterBar>
      
      {frames.length === 0 && !loading ? (
        <EmptyState>
          <Camera size={64} />
          <h3>No frames found</h3>
          <p>Try adjusting your filters or wait for new detections</p>
        </EmptyState>
      ) : (
        <GalleryGrid>
          {frames.map((frame, index) => (
            <FrameCard
              key={frame.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedFrame(frame)}
            >
              <FrameImage src={frame.frame_url} alt="Detection frame" />
              <FrameInfo>
                <FrameHeader>
                  <ThreatBadge level={frame.threat_level}>
                    {frame.threat_level.toUpperCase()}
                  </ThreatBadge>
                  <Button
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(frame.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </FrameHeader>
                <FrameMeta>
                  <div>📹 {frame.camera_name || 'Unknown Camera'}</div>
                  <div>🕐 {new Date(frame.timestamp).toLocaleString()}</div>
                  <div>🎯 {frame.detections.length} detections</div>
                </FrameMeta>
              </FrameInfo>
            </FrameCard>
          ))}
        </GalleryGrid>
      )}
      
      {loading && (
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          Loading...
        </LoadingSpinner>
      )}
      
      <div ref={loadMoreRef} style={{ height: '20px' }} />
      
      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedFrame && (
          <Lightbox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFrame(null)}
          >
            <LightboxContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LightboxImage src={selectedFrame.frame_url} alt="Detection frame" />
              <LightboxControls>
                <LightboxInfo>
                  <h3>{selectedFrame.camera_name}</h3>
                  <p>{new Date(selectedFrame.timestamp).toLocaleString()}</p>
                  <p>Threat: <ThreatBadge level={selectedFrame.threat_level}>{selectedFrame.threat_level}</ThreatBadge></p>
                </LightboxInfo>
                <LightboxActions>
                  <Button onClick={() => handleDelete(selectedFrame.id)} variant="danger">
                    <Trash2 size={18} />
                    Delete
                  </Button>
                  <Button onClick={() => setSelectedFrame(null)}>
                    <X size={18} />
                    Close
                  </Button>
                </LightboxActions>
              </LightboxControls>
            </LightboxContent>
          </Lightbox>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default FrameGalleryPage;

