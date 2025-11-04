const normalizeArrayField = require('./normalizeArrayField');

function setRoleSpecificFields(user, data) {
  const { role } = data;

  if (role === 'farmer') {
    user.farmName = data.farmName || '';
    user.farmAddress = data.farmAddress || '';
    user.farmGeolocation = data.farmGeolocation || '';
    user.cropsGrown = normalizeArrayField(data.cropsGrown);
    user.certifications = normalizeArrayField(data.certifications);
    user.photos = normalizeArrayField(data.photos);
  } else if (role === 'business') {
    user.companyName = data.companyName || '';
    user.businessType = data.businessType || '';
    user.companyAddress = data.companyAddress || '';
    user.gstin = data.gstin || '';
    user.cin = data.cin || '';
    user.contactPersonName = data.contactPersonName || '';
    user.contactPersonDesignation = data.contactPersonDesignation || '';
    user.produceRequired = normalizeArrayField(data.produceRequired);
    user.photos = normalizeArrayField(data.photos);
    user.certifications = normalizeArrayField(data.certifications);
  } else if (role === 'customer') {
    user.deliveryAddress = data.deliveryAddress || '';
    user.billingAddress = data.billingAddress || '';
  }

  return user;
}

module.exports = setRoleSpecificFields;
