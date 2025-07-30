import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.token;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  req.apiKey = apiKey;
  next();
};

// Get user's actors
app.get('/api/actors', validateApiKey, async (req, res) => {
  try {
    const response = await axios.get(`https://api.apify.com/v2/acts?token=${req.apiKey}`);
    const actors = response.data; // <-- This is the actual list
    res.json(actors); // Return only the array of actors
  } catch (error) {
    console.error('Error fetching actors:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Failed to fetch actors' });
    }
  }
});

// Get actor input schema
app.get('/api/actor-schema/:actorId', validateApiKey, async (req, res) => {
  try {
    const { actorId } = req.params;
    const response = await axios.get(`https://api.apify.com/v2/actors/${actorId}/input-schema?token=${req.apiKey}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching actor schema:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch actor schema' });
  }
});

// Run actor
app.post('/api/run-actor', validateApiKey, async (req, res) => {
  try {
    const { actorId, input } = req.body;
    
    if (!actorId) {
      return res.status(400).json({ error: 'Actor ID is required' });
    }

    // Start the actor run
    const runResponse = await axios.post(
      `https://api.apify.com/v2/actors/${actorId}/runs?token=${req.apiKey}&waitForFinish=120`,
      input,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const run = runResponse.data.data;
    
    // If the run finished immediately, return the result
    if (run.status === 'SUCCEEDED') {
      try {
        const outputResponse = await axios.get(`https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?token=${req.apiKey}&format=json`);
        res.json({
          runId: run.id,
          status: run.status,
          output: outputResponse.data
        });
      } catch (outputError) {
        console.error('Error fetching output:', outputError.message);
        res.json({
          runId: run.id,
          status: run.status,
          output: []
        });
      }
    } else if (run.status === 'FAILED') {
      res.json({
        runId: run.id,
        status: run.status,
        error: 'Actor run failed'
      });
    } else {
      // Run is still in progress, return status
      res.json({
        runId: run.id,
        status: run.status,
        message: 'Actor is still running'
      });
    }
  } catch (error) {
    console.error('Error running actor:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to run actor' });
  }
});

// Get run status and output
app.get('/api/run-status/:runId', validateApiKey, async (req, res) => {
  try {
    const { runId } = req.params;
    const response = await axios.get(`https://api.apify.com/v2/actor-runs/${runId}?token=${req.apiKey}`);
    const run = response.data.data;
    
    if (run.status === 'SUCCEEDED') {
      try {
        const outputResponse = await axios.get(`https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?token=${req.apiKey}&format=json`);
        res.json({
          runId: run.id,
          status: run.status,
          output: outputResponse.data
        });
      } catch (outputError) {
        res.json({
          runId: run.id,
          status: run.status,
          output: []
        });
      }
    } else {
      res.json({
        runId: run.id,
        status: run.status
      });
    }
  } catch (error) {
    console.error('Error fetching run status:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch run status' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});