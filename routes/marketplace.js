const db = require('../config/supabase');
const {requireCmsAuth,verifySiteOwnership}=require('../middleware/cmsAuth');
module.exports=require('../lib/marketplace').createMarketplaceRouter({db,enabled:()=>process.env.MARKETPLACE_ENABLED==='true',auth:requireCmsAuth,owns:verifySiteOwnership});
