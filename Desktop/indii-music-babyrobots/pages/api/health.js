const dbAdapter = require('../../lib/db-adapter');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const health = await dbAdapter.healthCheck();
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: health,
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    };

    // Return 200 for healthy, 503 for unhealthy
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(response);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}
