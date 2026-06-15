// Forced reload to pick up new catalog.json changes (iPhone 13 / 13 Pro / 12 and 13 mini screen fix v5)
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

let catalogData = null;

// Helper to load catalog in memory
const loadCatalog = () => {
  try {
    const catalogPath = path.join(__dirname, '../catalog/catalog.json');
    if (fs.existsSync(catalogPath)) {
      const content = fs.readFileSync(catalogPath, 'utf8');
      catalogData = JSON.parse(content);
      logger.info('Successfully loaded catalog.json into memory.');
      return true;
    } else {
      logger.warn(`catalog.json not found at: ${catalogPath}`);
      return false;
    }
  } catch (err) {
    logger.error('Failed to load catalog.json:', err);
    return false;
  }
};

// Initial load
loadCatalog();

const getCatalog = (req, res) => {
  if (!catalogData) {
    // Try to load again
    const loaded = loadCatalog();
    if (!loaded) {
      return errorResponse(res, 'Catalog data is not available on server', 500);
    }
  }
  return successResponse(res, 'Catalog retrieved successfully', catalogData);
};

const reloadCatalog = (req, res) => {
  const success = loadCatalog();
  if (success) {
    return successResponse(res, 'Catalog reloaded successfully in-memory');
  } else {
    return errorResponse(res, 'Failed to reload catalog', 500);
  }
};

module.exports = {
  getCatalog,
  reloadCatalog,
  // Export parsed data for backend verification if needed
  getCatalogData: () => catalogData
};
