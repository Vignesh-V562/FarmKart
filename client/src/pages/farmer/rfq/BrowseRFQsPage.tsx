import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
  Grid,
  Pagination,
} from '@mui/material';
import RFQCard from '../../../components/rfq/RFQCard.tsx';
import BidModal from '../../../components/rfq/BidModal.tsx';
import api from '../../../api/axios.js';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../hooks/useAuth';
import { fetchUniqueRegions } from '../../../api/rfqApi.js'; // Import fetchUniqueRegions

interface RFQ {
  _id: string;
  rfqId: string;
  product: string;
  quantity: number;
  unit: string;
  category: string;
  deliveryDeadline: string;
  buyerId: {
    name: string;
    companyName: string;
  };
  type: 'public' | 'private';
  imageUrl?: string;
}

const BrowseRFQsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('deliveryDeadline');
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [dynamicRegionOptions, setDynamicRegionOptions] = useState<string[]>([]); // New state for dynamic regions
  const [regionsLoading, setRegionsLoading] = useState<boolean>(true); // Loading state for regions

  const [isBidModalOpen, setIsBidModalOpen] = useState<boolean>(false);
  const [selectedRfqId, setSelectedRfqId] = useState<string>('');
  const [selectedRfqDeliveryDeadline, setSelectedRfqDeliveryDeadline] = useState<string>('');

  const categoryOptions = ['Vegetables', 'Grains', 'Fruits', 'Dairy', 'Meat', ''];
  const sortOptions = [
    { label: 'Delivery Deadline (Soonest First)', value: 'deliveryDeadline' },
    { label: 'Quantity (Low to High)', value: 'quantity' },
    { label: 'Quantity (High to Low)', value: '-quantity' },
    { label: 'Buyer Rating (High to Low)', value: '-buyerRating' },
  ];

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      const getRegions = async () => {
        setRegionsLoading(true);
        try {
          const regions = await fetchUniqueRegions();
          setDynamicRegionOptions(['', ...regions]); // Add empty string for "All Regions"
        } catch (err) {
          console.error('Failed to fetch regions:', err);
          enqueueSnackbar('Failed to load regions', { variant: 'error' });
        } finally {
          setRegionsLoading(false);
        }
      };
      getRegions();
    }
  }, [enqueueSnackbar, authLoading]);

  const fetchRFQs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/rfq/browse', {
        params: {
          keyword: searchTerm,
          category: categoryFilter,
          region: regionFilter,
          sort: sortOption,
          pageNumber: page,
        },
      });
      setRfqs(data.rfqs);
      setPages(data.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch RFQs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchRFQs();
    }
  }, [searchTerm, categoryFilter, regionFilter, sortOption, page, authLoading]);

  const handlePlaceBid = (rfqId: string, deliveryDeadline: string) => {
    setSelectedRfqId(rfqId);
    setSelectedRfqDeliveryDeadline(deliveryDeadline);
    setIsBidModalOpen(true);
  };

  const handleBidModalClose = () => {
    setIsBidModalOpen(false);
    setSelectedRfqId('');
    setSelectedRfqDeliveryDeadline('');
  };

  const handleBidSubmitted = () => {
    fetchRFQs();
    enqueueSnackbar('Bid submitted successfully!', { variant: 'success' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Browse RFQs
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Search Product"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="Filter by Category"
            variant="outlined"
            fullWidth
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option === '' ? 'All Categories' : option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="Filter by Region"
            variant="outlined"
            fullWidth
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            disabled={regionsLoading} // Disable while loading regions
          >
            {regionsLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Loading Regions...
              </MenuItem>
            ) : (
              dynamicRegionOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === '' ? 'All Regions' : option}
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="Sort By"
            variant="outlined"
            fullWidth
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : rfqs.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No open RFQs found matching your criteria.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {rfqs.map((rfq) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rfq._id}>
                <RFQCard rfq={rfq} onPlaceBid={() => handlePlaceBid(rfq._id, rfq.deliveryDeadline)} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

      <BidModal
        open={isBidModalOpen}
        onClose={handleBidModalClose}
        rfqId={selectedRfqId}
        rfqDeliveryDeadline={selectedRfqDeliveryDeadline}
        onBidSubmitted={handleBidSubmitted}
      />
    </Box>
  );
};

export default BrowseRFQsPage;