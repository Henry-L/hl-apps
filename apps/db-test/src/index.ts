import express, { Request, Response } from 'express';
import cors from 'cors';
import { Firestore } from '@google-cloud/firestore';

const app = express();
const port = process.env.PORT || 8080;

// Initialize Firestore
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT || undefined,
});

const COLLECTION = 'items';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML Template
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DB Test - Firestore Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 10px;
        }
        .section h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #374151;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1em;
            font-family: inherit;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #f5576c;
        }
        button {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button:active {
            transform: translateY(0);
        }
        .item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 4px solid #f5576c;
        }
        .item-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .item-desc {
            color: #6b7280;
            font-size: 0.9em;
        }
        .item-id {
            font-family: monospace;
            font-size: 0.8em;
            color: #9ca3af;
            margin-top: 5px;
        }
        .endpoints {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 10px;
        }
        .endpoint {
            font-family: 'Courier New', monospace;
            color: #f5576c;
            font-weight: 600;
            margin-bottom: 8px;
        }
        #items-list {
            margin-top: 15px;
        }
        .empty {
            color: #9ca3af;
            text-align: center;
            padding: 20px;
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .btn-small {
            padding: 6px 12px;
            font-size: 0.9em;
        }
        .btn-danger {
            background: #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ DB Test</h1>
        <p class="subtitle">Cloud Run + Firestore</p>
        <div class="status">● Connected</div>
        
        <div class="section">
            <h2>Add New Item</h2>
            <form id="add-form">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required placeholder="Enter title">
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3" placeholder="Enter description"></textarea>
                </div>
                <button type="submit">Add Item</button>
            </form>
        </div>

        <div class="section">
            <h2>Stored Items</h2>
            <div id="items-list">
                <div class="empty">Loading...</div>
            </div>
            <button onclick="loadItems()" style="margin-top: 15px;" class="btn-small">Refresh</button>
        </div>

        <div class="endpoints">
            <h2 style="margin-bottom: 15px;">API Endpoints</h2>
            <div class="endpoint">GET /api/items - List all items</div>
            <div class="endpoint">POST /api/items - Create item</div>
            <div class="endpoint">GET /api/items/:id - Get item</div>
            <div class="endpoint">DELETE /api/items/:id - Delete item</div>
            <div class="endpoint">GET /api/health - Health check</div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.pathname.includes('/apps/db-test') ? '/apps/db-test' : '';
        
        async function loadItems() {
            try {
                const response = await fetch(API_BASE + '/api/items');
                const data = await response.json();
                const container = document.getElementById('items-list');
                
                if (!data.items || data.items.length === 0) {
                    container.innerHTML = '<div class="empty">No items yet. Add one above!</div>';
                    return;
                }
                
                container.innerHTML = data.items.map(item => \`
                    <div class="item">
                        <div class="item-title">\${item.title}</div>
                        <div class="item-desc">\${item.description || 'No description'}</div>
                        <div class="item-id">ID: \${item.id}</div>
                        <div class="actions">
                            <button class="btn-small btn-danger" onclick="deleteItem('\${item.id}')">Delete</button>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading items:', error);
                document.getElementById('items-list').innerHTML = 
                    '<div class="empty">Error loading items</div>';
            }
        }
        
        async function deleteItem(id) {
            if (!confirm('Delete this item?')) return;
            
            try {
                const response = await fetch(API_BASE + '/api/items/' + id, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    loadItems();
                } else {
                    alert('Error deleting item');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error deleting item');
            }
        }
        
        document.getElementById('add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            
            try {
                const response = await fetch(API_BASE + '/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description })
                });
                
                if (response.ok) {
                    document.getElementById('add-form').reset();
                    loadItems();
                } else {
                    alert('Error adding item');
                }
            } catch (error) {
                console.error('Error adding item:', error);
                alert('Error adding item');
            }
        });
        
        // Load items on page load
        loadItems();
    </script>
</body>
</html>
`;

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

app.get('/apps/db-test', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

app.get('/apps/db-test/', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Test Firestore connection
    await firestore.collection(COLLECTION).limit(1).get();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

app.get('/apps/db-test/api/health', async (req: Request, res: Response) => {
  try {
    await firestore.collection(COLLECTION).limit(1).get();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// Get all items
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const snapshot = await firestore.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json({ items, count: items.length });
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

app.get('/apps/db-test/api/items', async (req: Request, res: Response) => {
  try {
    const snapshot = await firestore.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json({ items, count: items.length });
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

// Create item
app.post('/api/items', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const docRef = await firestore.collection(COLLECTION).add({
      title,
      description: description || '',
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Item created successfully' 
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.post('/apps/db-test/api/items', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const docRef = await firestore.collection(COLLECTION).add({
      title,
      description: description || '',
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Item created successfully' 
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Get single item
app.get('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const doc = await firestore.collection(COLLECTION).doc(req.params.id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

app.get('/apps/db-test/api/items/:id', async (req: Request, res: Response) => {
  try {
    const doc = await firestore.collection(COLLECTION).doc(req.params.id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

// Delete item
app.delete('/api/items/:id', async (req: Request, res: Response) => {
  try {
    await firestore.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

app.delete('/apps/db-test/api/items/:id', async (req: Request, res: Response) => {
  try {
    await firestore.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Firestore initialized`);
});

