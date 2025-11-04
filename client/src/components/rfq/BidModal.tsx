import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress, // Import CircularProgress for loading indicator
} from '@mui/material';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { fetchTransportMethods } from '../../api/rfqApi'; // Import fetchTransportMethods

interface BidModalProps {
  open: boolean;
  onClose: () => void;
  rfqId: string;
  rfqDeliveryDeadline: string;
  onBidSubmitted: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
};

const bidSchema = yup.object().shape({
  pricePerUnit: yup.number().positive('Price must be positive').required('Price is required'),
  deliveryWindowStart: yup.date().required('Delivery start date is required').min(new Date(), 'Start date cannot be in the past'),
  deliveryWindowEnd: yup.date().required('Delivery end date is required').min(yup.ref('deliveryWindowStart'), 'End date cannot be before start date'),
  transportMethod: yup.string().required('Transport method is required'),
  remarks: yup.string().optional(),
});

const BidModal: React.FC<BidModalProps> = ({ open, onClose, rfqId, rfqDeliveryDeadline, onBidSubmitted }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(bidSchema),
    defaultValues: {
      pricePerUnit: '',
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
      transportMethod: '',
      remarks: '',
    },
  });

  const { user, loading: authLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dynamicTransportMethods, setDynamicTransportMethods] = useState<string[]>([]); // New state for dynamic transport methods
  const [transportMethodsLoading, setTransportMethodsLoading] = useState<boolean>(true); // Loading state for transport methods

  useEffect(() => {
    if (!authLoading) {
      const getTransportMethods = async () => {
        setTransportMethodsLoading(true);
        try {
          const methods = await fetchTransportMethods();
          setDynamicTransportMethods(methods);
        } catch (err) {
          console.error('Failed to fetch transport methods:', err);
        } finally {
          setTransportMethodsLoading(false);
        }
      };
      getTransportMethods();
    }
  }, [authLoading]);

  const onSubmit = async (data: any) => {
    setSubmitError(null);
    try {
      if (new Date(data.deliveryWindowEnd) > new Date(rfqDeliveryDeadline)) {
        setSubmitError('Delivery window cannot exceed RFQ\'s deadline.');
        return;
      }

      await api.post(`/rfq/${rfqId}/bid`, {
        pricePerUnit: data.pricePerUnit,
        deliveryWindow: {
          start: data.deliveryWindowStart,
          end: data.deliveryWindowEnd,
        },
        transportMethod: data.transportMethod,
        remarks: data.remarks,
      });
      onBidSubmitted();
      onClose();
      reset();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit bid.');
      console.error(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="bid-modal-title"
      aria-describedby="bid-modal-description"
    >
      <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography id="bid-modal-title" variant="h5" component="h2" gutterBottom>
          Place Bid for RFQ: {rfqId}
        </Typography>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Controller
          name="pricePerUnit"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Offered Price per Unit"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.pricePerUnit}
              helperText={errors.pricePerUnit?.message}
            />
          )}
        />

        <Controller
          name="deliveryWindowStart"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Delivery Window Start"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!errors.deliveryWindowStart}
              helperText={errors.deliveryWindowStart?.message}
            />
          )}
        />

        <Controller
          name="deliveryWindowEnd"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Delivery Window End"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!errors.deliveryWindowEnd}
              helperText={errors.deliveryWindowEnd?.message}
            />
          )}
        />

        <FormControl fullWidth variant="outlined" margin="normal" error={!!errors.transportMethod}>
          <InputLabel id="transport-method-label">Transport Method</InputLabel>
          <Controller
            name="transportMethod"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="transport-method-label"
                label="Transport Method"
                disabled={transportMethodsLoading} // Disable while loading
              >
                {transportMethodsLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Loading Methods...
                  </MenuItem>
                ) : (
                  dynamicTransportMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          />
          {errors.transportMethod && <Typography color="error" variant="caption">{errors.transportMethod.message}</Typography>}
        </FormControl>

        <Controller
          name="remarks"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Remarks (Optional)"
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              margin="normal"
              error={!!errors.remarks}
              helperText={errors.remarks?.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 3 }}
        >
          Submit Bid
        </Button>
      </Box>
    </Modal>
  );
};

export default BidModal;
