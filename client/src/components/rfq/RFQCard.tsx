import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CardMedia, // Import CardMedia
} from '@mui/material';
import { AccessTime, Category, LocationOn, ShoppingCart } from '@mui/icons-material';

interface RFQCardProps {
  rfq: {
    _id: string;
    rfqId: string;
    product: string;
    quantity: number;
    unit: string;
    category: string;
    deliveryDeadline: string;
    buyerId: {
      name: string;
      companyName: string; // Add companyName for buyer info
    };
    type: 'public' | 'private';
    imageUrl?: string; // Add imageUrl field
  };
  onPlaceBid: (rfqId: string) => void;
}

const RFQCard: React.FC<RFQCardProps> = ({ rfq, onPlaceBid }) => {
  const deadline = new Date(rfq.deliveryDeadline).toLocaleDateString();
  const defaultImageUrl = 'https://via.placeholder.com/150'; // Placeholder image

  return (
    <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="140"
        image={rfq.imageUrl || defaultImageUrl}
        alt={rfq.product}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {rfq.product}
          </Typography>
          <Chip label={rfq.type === 'public' ? 'Public RFQ' : 'Private RFQ'} color={rfq.type === 'public' ? 'success' : 'info'} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          RFQ ID: {rfq.rfqId}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <ShoppingCart fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Quantity: {rfq.quantity} {rfq.unit}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Category fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Category: {rfq.category}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <AccessTime fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Delivery Deadline: {deadline}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Buyer: {rfq.buyerId?.companyName || 'N/A'} {/* Anonymized or business name */}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => onPlaceBid(rfq._id)}
        >
          Place Bid
        </Button>
      </CardContent>
    </Card>
  );
};

export default RFQCard;
