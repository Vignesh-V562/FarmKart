import { createRFQ } from '../../api/rfqApi';
import { fetchProductTitles, uploadFile } from '../../api/productApi';
import { fetchFarmers } from '../../api/profileApi'; // Import fetchFarmers
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Autocomplete,
  CircularProgress,
  LinearProgress,
  Chip, // Import Chip for multiple selections
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Define Yup schema for validation
const rfqSchema = yup.object().shape({
  product: yup.string().required('Product Name is required'),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  unit: yup.string().required('Unit is required'),
  category: yup.string().required('Category is required'),
  deliveryDeadline: yup.date().required('Delivery Deadline is required').min(new Date(), 'Delivery Deadline cannot be in the past'),
  additionalNotes: yup.string().optional(),
  type: yup.string().oneOf(['public', 'private']).required('RFQ Type is required'),
  attachments: yup.array(yup.string()).optional(),
  invitedFarmers: yup.array(yup.string()).when('type', {
    is: 'private',
    then: (schema) => schema.min(1, 'Private RFQs require at least one invited farmer').required('Invited farmers are required for private RFQs'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// Styled component for file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const RFQForm: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);
  const [productOptions, setProductOptions] = React.useState<string[]>([]);
  const [productOptionsLoading, setProductOptionsLoading] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = React.useState(false);
  const [farmerOptions, setFarmerOptions] = React.useState<any[]>([]); // State for farmer options
  const [farmerOptionsLoading, setFarmerOptionsLoading] = React.useState(false); // Loading state for farmer options

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(rfqSchema),
    defaultValues: {
      product: '',
      quantity: '',
      unit: '',
      category: '',
      deliveryDeadline: '',
      additionalNotes: '',
      type: 'public',
      attachments: [],
      invitedFarmers: [],
    },
  });

  const rfqType = watch('type'); // Watch RFQ type to conditionally render farmer selection

  React.useEffect(() => {
    const getProductTitles = async () => {
      setProductOptionsLoading(true);
      try {
        const titles = await fetchProductTitles();
        setProductOptions(titles);
      } catch (error) {
        console.error('Failed to fetch product titles:', error);
        enqueueSnackbar('Failed to load product options', { variant: 'error' });
      } finally {
        setProductOptionsLoading(false);
      }
    };
    getProductTitles();
  }, [enqueueSnackbar]);

  React.useEffect(() => {
    if (rfqType === 'private') {
      const getFarmers = async () => {
        setFarmerOptionsLoading(true);
        try {
          const farmers = await fetchFarmers();
          setFarmerOptions(farmers);
        } catch (error) {
          console.error('Failed to fetch farmers:', error);
          enqueueSnackbar('Failed to load farmer options', { variant: 'error' });
        } finally {
          setFarmerOptionsLoading(false);
        }
      };
      getFarmers();
    } else {
      setValue('invitedFarmers', []); // Clear invited farmers if RFQ type changes to public
    }
  }, [rfqType, enqueueSnackbar, setValue]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadingFiles(true);
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);

      const uploadedUrls: string[] = [];
      try {
        for (const file of filesArray) {
          const url = await uploadFile(file);
          uploadedUrls.push(url);
        }
        const currentAttachments = getValues('attachments') || [];
        setValue('attachments', [...currentAttachments, ...uploadedUrls], { shouldValidate: true });
        enqueueSnackbar('Files uploaded successfully!', { variant: 'success' });
      } catch (error) {
        console.error('Failed to upload files:', error);
        enqueueSnackbar('Failed to upload files', { variant: 'error' });
      } finally {
        setUploadingFiles(false);
      }
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const rfqData = {
        product: data.product,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        deliveryDeadline: data.deliveryDeadline,
        additionalNotes: data.additionalNotes,
        type: data.type,
        attachments: data.attachments,
        invitedFarmers: data.invitedFarmers.map((farmer: any) => farmer._id), // Send only IDs to backend
      };
      await createRFQ(rfqData);
      enqueueSnackbar('RFQ created successfully!', { variant: 'success' });
      navigate('/business/my-rfqs');
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to create RFQ', { variant: 'error' });
      console.error('Failed to create RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const unitOptions = ['kg', 'ton', 'crate', 'dozen', 'piece'];
  const categoryOptions = ['Vegetables', 'Grains', 'Fruits', 'Dairy', 'Meat'];

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        '& .MuiTextField-root': { m: 1, width: '100%' },
        '& .MuiFormControl-root': { m: 1, width: '100%' },
        p: 3,
        maxWidth: 800,
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: '12px',
        boxShadow: 3,
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Create New RFQ
      </Typography>

      <Controller
        name="product"
        control={control}
        render={({ field }) => (
          <Autocomplete
            {...field}
            freeSolo
            options={productOptions}
            loading={productOptionsLoading}
            onChange={(event, newValue) => {
              field.onChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product Name"
                variant="outlined"
                error={!!errors.product}
                helperText={errors.product?.message}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {productOptionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2, m: 1 }}>
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Quantity"
              type="number"
              variant="outlined"
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              fullWidth
            />
          )}
        />
        <FormControl fullWidth variant="outlined" error={!!errors.unit}>
          <InputLabel id="unit-label">Unit</InputLabel>
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId="unit-label"
                label="Unit"
              >
                {unitOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.unit && <Typography color="error" variant="caption">{errors.unit.message}</Typography>}
        </FormControl>
      </Box>

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Category"
            variant="outlined"
            error={!!errors.category}
            helperText={errors.category?.message}
            fullWidth
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="deliveryDeadline"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Delivery Deadline"
            type="date"
            variant="outlined"
            error={!!errors.deliveryDeadline}
            helperText={errors.deliveryDeadline?.message}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
      />

      <Controller
        name="additionalNotes"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Additional Notes"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            sx={{ mt: 2 }}
          />
        )}
      />

      <Box sx={{ m: 1, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body1" component="span">
          RFQ Type:
        </Typography>
        <FormControlLabel
          control={
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Switch
                  {...field}
                  checked={field.value === 'private'}
                  onChange={(e) => field.onChange(e.target.checked ? 'private' : 'public')}
                  color="primary"
                />
              )}
            />
          }
          label={
            <Typography variant="body1" component="span">
              {rfqType === 'private' ? 'Private (Invite-only)' : 'Public (Open to all farmers)'}
            </Typography>
          }
        />
      </Box>

      {rfqType === 'private' && (
        <Controller
          name="invitedFarmers"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              multiple
              options={farmerOptions}
              loading={farmerOptionsLoading}
              disableCloseOnSelect
              getOptionLabel={(option) => option.fullName || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onChange={(event, newValue) => {
                field.onChange(newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option.fullName} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Invite Farmers"
                  placeholder="Select farmers to invite"
                  variant="outlined"
                  error={!!errors.invitedFarmers}
                  helperText={errors.invitedFarmers?.message}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {farmerOptionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />
      )}

      <Box sx={{ m: 1, mt: 3 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<span>📎</span>}
          sx={{ mr: 2 }}
          disabled={uploadingFiles}
        >
          Upload Attachments
          <VisuallyHiddenInput type="file" multiple onChange={handleFileChange} />
        </Button>
        <Typography variant="caption" color="text.secondary">
          (e.g., photos, spec sheets)
        </Typography>
        {uploadingFiles && <LinearProgress sx={{ mt: 1 }} />}
        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">Selected Files:</Typography>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </Box>
        )}
        {getValues('attachments').length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">Uploaded Attachments:</Typography>
            <ul>
              {getValues('attachments').map((url, index) => (
                <li key={index}><a href={url} target="_blank" rel="noopener noreferrer">{url.substring(url.lastIndexOf('/') + 1)}</a></li>
              ))}
            </ul>
          </Box>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{ mt: 4 }}
        disabled={loading || uploadingFiles}
      >
        {loading ? 'Creating...' : 'Create RFQ'}
      </Button>
    </Box>
  );
};

export default RFQForm;
