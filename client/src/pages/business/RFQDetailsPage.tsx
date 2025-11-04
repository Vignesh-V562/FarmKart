import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { AccessTime, Category, LocationOn, ShoppingCart, CheckCircle, Cancel, Gavel } from '@mui/icons-material';
import api from '../../api/axios'; // Assuming this is your configured axios instance

interface RFQ {
  _id: string;
  rfqId: string;
  product: string;
  quantity: number;
  unit: string;
  category: string;
  deliveryDeadline: string;
  additionalNotes?: string;
  attachments?: string[];
  buyerId: {
    name: string;
  };
  type: 'public' | 'private';
  status: 'open' | 'closed' | 'accepted' | 'cancelled';
  createdAt: string;
}

interface Bid {
  _id: string;
  bidId: string;
  farmerId: {
    name: string;
  };
  pricePerUnit: number;
  deliveryWindow: {
    start: string;
    end: string;
  };
  transportMethod: string;
  remarks?: string;
  score: number;
  status: 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

const RFQDetailsPage: React.FC = () => {
  const { id: rfqId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<boolean>(false);

  const fetchRFQDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const rfqResponse = await api.get(`/api/rfq/${rfqId}`); // Assuming a GET /api/rfq/:id endpoint exists
      setRfq(rfqResponse.data);

      const bidsResponse = await api.get(`/api/rfq/${rfqId}/bids`);
      setBids(bidsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch RFQ details or bids.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rfqId) {
      fetchRFQDetails();
    }
  }, [rfqId]);

  const handleAcceptBid = async (bidId: string) => {
    if (!window.confirm('Are you sure you want to accept this bid? This will close the RFQ and reject all other bids.')) {
      return;
    }

    setAcceptingBid(true);
    try {
      await api.post(`/api/rfq/${rfqId}/accept/${bidId}`);
      // Refetch data to update statuses
      fetchRFQDetails();
      // TODO: Show success toast
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept bid.');
      console.error(err);
    } finally {
      setAcceptingBid(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!rfq) {
    return (
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
        RFQ not found.
      </Typography>
    );
  }

  const sortedBids = [...bids].sort((a, b) => b.score - a.score); // Sort by score descending
  const bestBid = sortedBids.length > 0 ? sortedBids[0] : null;

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back to RFQs
      </Button>

      <Card sx={{ mb: 4, borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              {rfq.product}
            </Typography>
            <Chip
              label={rfq.status.toUpperCase()}
              color={rfq.status === 'open' ? 'success' : rfq.status === 'accepted' ? 'primary' : 'default'}
              sx={{ textTransform: 'uppercase' }}
            />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            RFQ ID: {rfq.rfqId}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Buyer: {rfq.buyerId?.name || 'N/A'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Quantity: {rfq.quantity} {rfq.unit}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Category: {rfq.category}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Delivery Deadline: {new Date(rfq.deliveryDeadline).toLocaleDateString()}
          </Typography>
          {rfq.additionalNotes && (
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              Notes: {rfq.additionalNotes}
            </Typography>
          )}
          {/* TODO: Display attachments */}
        </CardContent>
      </Card>

      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
        Bids Received ({bids.length})
      </Typography>

      {bids.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No bids have been submitted for this RFQ yet.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Farmer</TableCell>
                <TableCell>Price per Unit</TableCell>
                <TableCell>Delivery Window</TableCell>
                <TableCell>Transport</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBids.map((bid) => (
                <TableRow key={bid._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: bid === bestBid ? 'primary.light' : 'inherit' }}>
                  <TableCell>{bid.farmerId?.name || 'N/A'}</TableCell>
                  <TableCell>₹{bid.pricePerUnit.toFixed(2)}</TableCell>
                  <TableCell>{new Date(bid.deliveryWindow.start).toLocaleDateString()} - {new Date(bid.deliveryWindow.end).toLocaleDateString()}</TableCell>
                  <TableCell>{bid.transportMethod}</TableCell>
                  <TableCell>{bid.score.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={bid.status.toUpperCase()}
                      color={
                        bid.status === 'accepted' ? 'success' :
                        bid.status === 'rejected' ? 'error' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {rfq.status === 'open' && bid.status === 'submitted' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleAcceptBid(bid._id)}
                        disabled={acceptingBid}
                        startIcon={<Gavel />}
                      >
                        Accept
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RFQDetailsPage;
