import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaTimes, FaUpload, FaChevronDown } from 'react-icons/fa';

const productSchema = yup.object({
  title: yup.string().required('Product title is required').min(3),
  description: yup.string().required('Product description is required').min(10),
  category: yup.string().required('Category is required'),
  subcategory: yup.string(),
  origin: yup.string(),
  price: yup.number().required('Price is required').positive(),
  currency: yup.string(),
  discount: yup.number().min(0),
  unit: yup.string().required('Unit is required'),
  quantity: yup.number().required('Quantity is required').min(0),
  moq: yup.number().required('MOQ is required').min(1),
  harvestDate: yup.date().required('Harvest date is required').typeError('Invalid date'),
  shelfLife: yup.string(),
  grade: yup.string().required('Grade is required'),
  packaging: yup.string().required('Packaging is required'),
  sku: yup.string(),
  video: yup.string().url('Must be a valid URL'),
  deliveryRadius: yup.string(),
  shippingCharges: yup.number().min(0),
  leadTime: yup.string(),
  additionalInfo: yup.string(),
  isAvailable: yup.boolean(),
  isFeatured: yup.boolean(),
  seo: yup.object({
    slug: yup.string(),
    metaDesc: yup.string(),
  }),
});

const ProductForm = ({ product, onProductSaved, onClose }) => {
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch
  } = useForm({
    resolver: yupResolver(productSchema),
  });

  const status = watch('status', product?.status || 'draft');

  useEffect(() => {
    if (product) {
      Object.keys(product).forEach(key => {
        if (key === 'harvestDate' && product.harvestDate) {
          setValue(key, new Date(product.harvestDate).toISOString().split('T')[0]);
        } else if (key === 'seo') {
          setValue('seo.slug', product.seo?.slug);
          setValue('seo.metaDesc', product.seo?.metaDesc);
        } else {
          setValue(key, product[key]);
        }
      });
      setImages(product.images || []);
      setTags(product.tags || []);
      setKeywords(product.keywords || []);
      setShippingOptions(product.shippingOptions || []);
      setCertifications(product.certifications || []);
    }
  }, [product, setValue]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImageUrls]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagInput = (e, value, setter, list, listSetter) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      if (!list.includes(value.trim())) {
        listSetter([...list, value.trim()]);
      }
      setter('');
    }
  };

  const removeTag = (tagToRemove, list, listSetter) => {
    listSetter(list.filter(tag => tag !== tagToRemove));
  };

  const handleCheckboxGroup = (option, list, listSetter) => {
    const newList = list.includes(option)
      ? list.filter(item => item !== option)
      : [...list, option];
    listSetter(newList);
  };

  const onFormSubmit = (data) => {
    const finalData = {
      ...data,
      images,
      tags,
      keywords,
      shippingOptions,
      certifications,
    };
    onProductSaved(finalData);
  };
  
  const handleSave = (newStatus) => {
    setValue('status', newStatus);
    handleSubmit(onFormSubmit)();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <form className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <FormSection title="Basic Information">
              <InputField label="Product Title" error={errors.title} {...register('title')} placeholder="e.g., Organic Honey" />
              <TextareaField label="Description" error={errors.description} {...register('description')} placeholder="Describe your product..." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField label="Category" error={errors.category} {...register('category')} options={['Vegetables', 'Fruits', 'Grains', 'Spices', 'Herbs', 'Flowers', 'Other']} />
                <InputField label="Subcategory" error={errors.subcategory} {...register('subcategory')} placeholder="e.g., Leafy Greens" />
              </div>
              <InputField label="Origin (Farm/GPS)" error={errors.origin} {...register('origin')} placeholder="e.g., Springfield Farm, 12.9716° N, 77.5946° E" />
            </FormSection>

            <FormSection title="Media">
              <ImageUploadField onUpload={handleImageUpload} images={images} onRemove={removeImage} />
              <InputField label="Video URL (optional)" error={errors.video} {...register('video')} placeholder="https://youtube.com/watch?v=..." />
            </FormSection>

            <FormSection title="Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Harvest Date" type="date" error={errors.harvestDate} {...register('harvestDate')} />
                <InputField label="Shelf Life / Expiry" error={errors.shelfLife} {...register('shelfLife')} placeholder="e.g., 2 weeks" />
                <SelectField label="Grade" error={errors.grade} {...register('grade')} options={['Premium', 'Grade A', 'Grade B', 'Standard', 'Commercial']} />
                <SelectField label="Packaging" error={errors.packaging} {...register('packaging')} options={['Loose', 'Plastic Bag', 'Cardboard Box', 'Wooden Crate', 'Jute Bag', 'Vacuum Sealed', 'Other']} />
                <InputField label="SKU / Barcode" error={errors.sku} {...register('sku')} placeholder="e.g., SKU12345" />
              </div>
            </FormSection>
            
            <FormSection title="Marketing">
                <TagInputField
                    label="Tags"
                    tags={tags}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    onAddTag={() => { if (newTag.trim() && !tags.includes(newTag.trim())) { setTags([...tags, newTag.trim()]); setNewTag(''); } }}
                    onRemoveTag={(tag) => removeTag(tag, tags, setTags)}
                    onKeyDown={(e) => handleTagInput(e, newTag, setNewTag, tags, setTags)}
                />
                <TagInputField
                    label="Keywords"
                    tags={keywords}
                    newTag={newKeyword}
                    setNewTag={setNewKeyword}
                    onAddTag={() => { if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) { setKeywords([...keywords, newKeyword.trim()]); setNewKeyword(''); } }}
                    onRemoveTag={(keyword) => removeTag(keyword, keywords, setKeywords)}
                    onKeyDown={(e) => handleTagInput(e, newKeyword, setNewKeyword, keywords, setKeywords)}
                />
            </FormSection>

            <FormSection title="Logistics">
                <CheckboxGroup label="Shipping Options" options={['Pickup', 'Delivery', 'Express Delivery', 'Cold Chain']} selected={shippingOptions} onChange={(option) => handleCheckboxGroup(option, shippingOptions, setShippingOptions)} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Delivery Radius" error={errors.deliveryRadius} {...register('deliveryRadius')} placeholder="e.g., 20km" />
                    <InputField label="Shipping Charges" type="number" step="0.01" error={errors.shippingCharges} {...register('shippingCharges')} placeholder="0.00" />
                    <InputField label="Lead Time" error={errors.leadTime} {...register('leadTime')} placeholder="e.g., 2-3 days" />
                </div>
            </FormSection>

            <FormSection title="Certifications">
                <CheckboxGroup label="Certifications" options={['Organic', 'FSSAI', 'ISO', 'Halal', 'Kosher', 'Fair Trade', 'Rainforest Alliance', 'Other']} selected={certifications} onChange={(option) => handleCheckboxGroup(option, certifications, setCertifications)} />
            </FormSection>

            <FormSection title="SEO">
                <InputField label="URL Slug" error={errors.seo?.slug} {...register('seo.slug')} placeholder="e.g., organic-honey-500g" />
                <TextareaField label="Meta Description" error={errors.seo?.metaDesc} {...register('seo.metaDesc')} placeholder="A short description for search engines..." />
            </FormSection>

            <FormSection title="Additional Information">
                <TextareaField label="Additional Info" error={errors.additionalInfo} {...register('additionalInfo')} placeholder="Any other details..." />
            </FormSection>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <FormSection title="Pricing & Inventory">
              <div className="grid grid-cols-2 gap-6 items-end">
                <InputField label="Price" type="number" step="0.01" error={errors.price} {...register('price')} placeholder="0.00" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <button type="button" className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium focus:outline-none focus:border-green-500">
                    {watch('currency', product?.currency || 'INR')}
                  </button>
                </div>
              </div>
              <InputField label="Discount (%)" type="number" error={errors.discount} {...register('discount')} placeholder="0" />
              <div className="grid grid-cols-2 gap-6 items-end">
                <InputField label="Stock Quantity" type="number" error={errors.quantity} {...register('quantity')} placeholder="0" />
                <SelectField label="Unit" error={errors.unit} {...register('unit')} options={['kg', 'g', 'lb', 'ton', 'piece', 'dozen', 'bunch', 'bag', 'box', 'quintal']} />
              </div>
              <InputField label="MOQ (Minimum Order Quantity)" type="number" error={errors.moq} {...register('moq')} placeholder="1" />
            </FormSection>

            <FormSection title="Visibility">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Available for sale</label>
                    <Controller name="isAvailable" control={control} defaultValue={product?.isAvailable ?? true} render={({ field }) => <ToggleSwitch checked={field.value} onChange={field.onChange} />} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Featured product</label>
                    <Controller name="isFeatured" control={control} defaultValue={product?.isFeatured ?? false} render={({ field }) => <input type="checkbox" className="h-6 w-6 rounded text-green-600 focus:ring-green-500" checked={field.value} onChange={field.onChange} />} />
                </div>
            </FormSection>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-5 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="button" onClick={() => handleSave('draft')} className="px-5 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-60 transition-colors">Save as Draft</button>
          <button type="button" onClick={() => handleSave('private')} className="px-5 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-colors">Save as Private</button>
          <button type="button" onClick={() => handleSave('published')} className="px-5 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">{status === 'published' ? 'Update Product' : 'Publish'}</button>
          {status === 'published' && <button type="button" onClick={() => handleSave('unlisted')} className="px-5 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors">Unlist</button>}
        </div>
      </form>
    </div>
  );
};

// Sub-components for the form
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

const InputField = React.forwardRef(({ label, type = 'text', error, ...props }, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} ref={ref} {...props} className={`w-full px-3.5 py-2.5 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500`} />
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
));

const TextareaField = React.forwardRef(({ label, error, ...props }, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea ref={ref} {...props} rows={4} className={`w-full px-3.5 py-2.5 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500`} />
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
));

const SelectField = React.forwardRef(({ label, options, error, ...props }, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <select ref={ref} {...props} className={`w-full px-3.5 py-2.5 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500 appearance-none pr-10`}>
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt.toLowerCase().replace(' ', '-')}>{opt}</option>)}
      </select>
      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
));

const ImageUploadField = ({ onUpload, images, onRemove }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (up to 5)</label>
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
      {images.map((img, i) => (
        <div key={i} className="relative">
          <img src={img} alt="" className="w-full h-24 object-cover rounded-lg shadow-sm" />
          <button type="button" onClick={() => onRemove(i)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"><FaTimes /></button>
        </div>
      ))}
      {images.length < 5 && (
        <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
          <FaUpload className="text-gray-400" />
          <span className="text-xs text-gray-500 mt-1">Upload</span>
          <input type="file" multiple accept="image/*" onChange={onUpload} className="hidden" />
        </label>
      )}
    </div>
  </div>
);

const TagInputField = ({ label, tags, newTag, setNewTag, onAddTag, onRemoveTag, onKeyDown }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={onKeyDown} placeholder={`Add a ${label.toLowerCase()}...`} className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button type="button" onClick={onAddTag} className="px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <div key={tag} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
            <span>{tag}</span>
            <button type="button" onClick={() => onRemoveTag(tag)}><FaTimes className="text-xs" /></button>
          </div>
        ))}
      </div>
    </div>
  );

const CheckboxGroup = ({ label, options, selected, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {options.map(option => (
                <label key={option} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-5 w-5 rounded text-green-600 focus:ring-green-500"
                        checked={selected.includes(option.toLowerCase().replace(' ', '-'))}
                        onChange={() => onChange(option.toLowerCase().replace(' ', '-'))}
                    />
                    <span>{option}</span>
                </label>
            ))}
        </div>
    </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-green-600' : 'bg-gray-300'}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

export default ProductForm;
