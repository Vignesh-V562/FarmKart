const calculateBidScore = (bid, rfq, farmerRating = 3.5) => {
  // Placeholder weights - these can be configured
  const w1 = 0.5; // Weight for priceFactor
  const w2 = 0.3; // Weight for distanceFactor
  const w3 = 0.2; // Weight for farmerRating

  // 1. Price Factor: normalized inverse of bid price (lower = better)
  // Assuming a hypothetical max price for normalization. In a real system, this might be dynamic.
  const maxPrice = 1000; // Example max price, adjust as needed
  const priceFactor = 1 - (bid.pricePerUnit / maxPrice); // Higher for lower price

  // Ensure priceFactor is not negative
  const normalizedPriceFactor = Math.max(0, priceFactor);

  // 2. Distance Factor: computed via Google Maps API (closer = higher score)
  // Placeholder: In a real application, this would involve calling Google Maps API
  // and comparing RFQ location with farmer location.
  // For now, a static value or a simple random value.
  const distanceFactor = 0.8; // Placeholder: Assuming a good distance for now

  // 3. Farmer Rating: pulled from past transactions (average rating out of 5)
  // Placeholder: This would come from the farmer's profile or a rating system.
  // The `farmerRating` parameter is passed to this function.
  const normalizedFarmerRating = farmerRating / 5; // Normalize to 0-1 range

  const finalScore = 
    (w1 * normalizedPriceFactor) +
    (w2 * distanceFactor) +
    (w3 * normalizedFarmerRating);

  return finalScore;
};

module.exports = { calculateBidScore };
