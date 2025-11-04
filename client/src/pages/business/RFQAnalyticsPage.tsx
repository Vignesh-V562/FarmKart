import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import api from '../../api/axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  totalRFQs: number;
  totalBids: number;
  averageBidsPerRFQ: string;
  rfqStatusCounts: Array<{ _id: string; count: number }>;
  bidStatusCounts: Array<{ _id: string; count: number }>;
}

const RFQAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/api/rfq/analytics');
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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

  if (!analyticsData) {
    return (
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
        No analytics data available.
      </Typography>
    );
  }

  // Chart data for RFQ Status
  const rfqStatusChartData = {
    labels: analyticsData.rfqStatusCounts.map((item) => item._id),
    datasets: [
      {
        label: 'RFQs by Status',
        data: analyticsData.rfqStatusCounts.map((item) => item.count),
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#9E9E9E'], // Green, Amber, Red, Grey
        borderColor: ['#4CAF50', '#FFC107', '#F44336', '#9E9E9E'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for Bid Status
  const bidStatusChartData = {
    labels: analyticsData.bidStatusCounts.map((item) => item._id),
    datasets: [
      {
        label: 'Bids by Status',
        data: analyticsData.bidStatusCounts.map((item) => item.count),
        backgroundColor: ['#2196F3', '#4CAF50', '#F44336', '#9E9E9E'], // Blue, Green, Red, Grey
        borderColor: ['#2196F3', '#4CAF50', '#F44336', '#9E9E9E'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        RFQ & Bid Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total RFQs
              </Typography>
              <Typography variant="h3" component="div" color="primary.main">
                {analyticsData.totalRFQs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Bids
              </Typography>
              <Typography variant="h3" component="div" color="secondary.main">
                {analyticsData.totalBids}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg. Bids per RFQ
              </Typography>
              <Typography variant="h3" component="div" color="info.main">
                {analyticsData.averageBidsPerRFQ}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom align="center">
                RFQ Status Distribution
              </Typography>
              <Pie data={rfqStatusChartData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom align="center">
                Bid Status Distribution
              </Typography>
              <Bar data={bidStatusChartData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RFQAnalyticsPage;
