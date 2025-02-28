/**
 * Middleware to identify and set the current tenant based on request
 * This enables multi-tenancy by isolating data per tenant
 */
const { Tenant } = require('../models');

/**
 * Identifies the tenant based on the request
 * It can use various strategies:
 * 1. Subdomain (e.g., shop1.ajiro.com)
 * 2. Custom domain (mapped in tenant table)
 * 3. Header (X-Tenant-ID)
 * 4. JWT token claim
 */
const identifyTenant = async (req, res, next) => {
  try {
    let tenantId;
    
    // Strategy 1: Check for tenant ID in headers
    if (req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'];
    }
    
    // Strategy 2: Check for tenant in hostname (subdomain)
    else if (req.hostname && req.hostname !== 'localhost') {
      const hostnameArray = req.hostname.split('.');
      
      // If it's a subdomain (e.g., tenant1.ajiro.com)
      if (hostnameArray.length > 2) {
        const subdomain = hostnameArray[0];
        const tenant = await Tenant.findOne({ 
          where: { 
            schemaName: `tenant_${subdomain}` 
          } 
        });
        
        if (tenant) {
          tenantId = tenant.id;
        }
      } 
      // Could be a custom domain
      else {
        const tenant = await Tenant.findOne({ 
          where: { 
            domain: req.hostname 
          } 
        });
        
        if (tenant) {
          tenantId = tenant.id;
        }
      }
    }
    
    // Strategy 3: Extract from authenticated user's token (if auth middleware runs before this)
    else if (req.user && req.user.tenantId) {
      tenantId = req.user.tenantId;
    }
    
    // If tenant was found, set in request object for later use
    if (tenantId) {
      req.tenantId = tenantId;
      // You could also load and attach the tenant data if needed
      const tenant = await Tenant.findByPk(tenantId);
      if (tenant && tenant.status === 'active') {
        req.tenant = tenant;
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Tenant inactive or not found'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Tenant identification error:', error);
    next(error);
  }
};

/**
 * Middleware that requires a tenant to be identified
 * Use this on routes that must have a tenant context
 */
const requireTenant = (req, res, next) => {
  if (!req.tenantId) {
    return res.status(400).json({
      status: 'error',
      message: 'Tenant context required for this operation'
    });
  }
  next();
};

module.exports = {
  identifyTenant,
  requireTenant
}; 