import React from 'react';
import RFQForm from '../../components/rfq/RFQForm';
import { Box, Typography } from '@mui/material';

const CreateRFQPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Create New Request for Quotation
      </Typography>
      <RFQForm />
    </Box>
  );
};

export default CreateRFQPage;
