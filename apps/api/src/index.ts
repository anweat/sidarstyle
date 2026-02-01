import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import {
  CreateWardrobeItemSchema,
  RecommendationRequestSchema,
  CreateFeedbackSchema,
  type WardrobeItem,
  type CreateWardrobeItem,
  type Outfit,
} from '@sidarstyle/shared';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const parseJsonArray = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeOptionalString = (value?: string | null) => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const toWardrobeItem = (item: any): WardrobeItem => ({
  id: item.id,
  name: item.name,
  category: item.category as WardrobeItem['category'],
  subcategory: item.subcategory ?? undefined,
  color: item.color,
  brand: item.brand ?? undefined,
  size: item.size ?? undefined,
  material: item.material ?? undefined,
  pattern: (item.pattern ?? undefined) as WardrobeItem['pattern'],
  fit: (item.fit ?? undefined) as WardrobeItem['fit'],
  season: parseJsonArray(item.season) as WardrobeItem['season'],
  style: parseJsonArray(item.style) as WardrobeItem['style'],
  occasion: parseJsonArray(item.occasion) as WardrobeItem['occasion'],
  condition: (item.condition ?? undefined) as WardrobeItem['condition'],
  warmth: item.warmth ?? undefined,
  waterproof: item.waterproof ?? false,
  price: item.price ?? undefined,
  purchaseDate: item.purchaseDate ?? undefined,
  notes: item.notes ?? undefined,
  tags: parseJsonArray(item.tags),
  imageUrl: item.imageUrl ?? undefined,
  createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
});

const toWardrobeItemData = (data: CreateWardrobeItem) => ({
  name: data.name.trim(),
  category: data.category,
  subcategory: normalizeOptionalString(data.subcategory),
  color: data.color.trim(),
  brand: normalizeOptionalString(data.brand),
  size: normalizeOptionalString(data.size),
  material: normalizeOptionalString(data.material),
  pattern: data.pattern ?? null,
  fit: data.fit ?? null,
  season: JSON.stringify(data.season ?? []),
  style: JSON.stringify(data.style ?? []),
  occasion: JSON.stringify(data.occasion ?? []),
  condition: data.condition ?? null,
  warmth: data.warmth ?? null,
  waterproof: data.waterproof ?? false,
  price: data.price ?? null,
  purchaseDate: normalizeOptionalString(data.purchaseDate),
  notes: normalizeOptionalString(data.notes),
  tags: JSON.stringify(data.tags ?? []),
  imageUrl: normalizeOptionalString(data.imageUrl),
});

// Health check (accessible at both /health and /api/health)
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      port: PORT,
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      port: PORT,
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// Wardrobe CRUD endpoints
app.get('/api/wardrobe/items', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.wardrobeItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedItems = items.map(toWardrobeItem);
    
    res.json(formattedItems);
  } catch (error) {
    console.error('Error fetching wardrobe items:', error);
    res.status(500).json({ error: 'Failed to fetch wardrobe items' });
  }
});

app.get('/api/wardrobe/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.wardrobeItem.findUnique({
      where: { id },
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(toWardrobeItem(item));
  } catch (error) {
    console.error('Error fetching wardrobe item:', error);
    res.status(500).json({ error: 'Failed to fetch wardrobe item' });
  }
});

app.post('/api/wardrobe/items', async (req: Request, res: Response) => {
  try {
    const validatedData = CreateWardrobeItemSchema.parse(req.body);
    
    const item = await prisma.wardrobeItem.create({
      data: {
        ...toWardrobeItemData(validatedData),
      },
    });
    
    res.status(201).json(toWardrobeItem(item));
  } catch (error: any) {
    console.error('Error creating wardrobe item:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create wardrobe item' });
  }
});

app.put('/api/wardrobe/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = CreateWardrobeItemSchema.parse(req.body);
    
    const item = await prisma.wardrobeItem.update({
      where: { id },
      data: {
        ...toWardrobeItemData(validatedData),
      },
    });
    
    res.json(toWardrobeItem(item));
  } catch (error: any) {
    console.error('Error updating wardrobe item:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(500).json({ error: 'Failed to update wardrobe item' });
  }
});

app.delete('/api/wardrobe/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.wardrobeItem.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting wardrobe item:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(500).json({ error: 'Failed to delete wardrobe item' });
  }
});

// Recommendation engine
function scoreOutfit(
  items: WardrobeItem[],
  request: any
): number {
  let score = 50; // Base score
  
  // Check formality match
  const formalityTags = {
    'casual': ['casual', 'comfortable'],
    'business-casual': ['business-casual', 'versatile'],
    'formal': ['formal', 'professional'],
    'semi-formal': ['formal', 'professional', 'elegant'],
  };
  
  const targetTags = formalityTags[request.formality as keyof typeof formalityTags] || [];
  const matchingTags = items.reduce((count, item) => {
    return count + item.tags.filter((tag: string) => targetTags.includes(tag)).length;
  }, 0);
  
  score += matchingTags * 5;
  
  // Comfort bonus
  if (request.comfort >= 7 && items.some(item => item.tags.includes('comfortable'))) {
    score += 10;
  }
  
  // Complete outfit bonus
  const categories = items.map(item => item.category);
  if (categories.includes('top') && categories.includes('bottom') && categories.includes('shoes')) {
    score += 15;
  }
  
  return Math.min(Math.max(score, 0), 100);
}

function generateRationale(items: WardrobeItem[], request: any, score: number): string {
  const categories = items.map(item => item.category);
  const itemNames = items.map(item => item.name).join(', ');
  
  let rationale = `This outfit combines ${itemNames}. `;
  
  if (score >= 80) {
    rationale += 'Excellent match for your requirements! ';
  } else if (score >= 60) {
    rationale += 'Good match for your requirements. ';
  } else {
    rationale += 'Acceptable match for your requirements. ';
  }
  
  if (categories.includes('top') && categories.includes('bottom') && categories.includes('shoes')) {
    rationale += 'This is a complete outfit ready to wear. ';
  }
  
  rationale += `The ${request.formality} style and your comfort level of ${request.comfort}/10 have been considered.`;
  
  return rationale;
}

app.post('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const validatedRequest = RecommendationRequestSchema.parse(req.body);
    
    // Store the request
    const storedRequest = await prisma.recommendationRequest.create({
      data: {
        occasion: validatedRequest.occasion,
        style: validatedRequest.style,
        formality: validatedRequest.formality,
        comfort: validatedRequest.comfort,
        budget: validatedRequest.budget,
        constraints: JSON.stringify(validatedRequest.constraints || []),
      },
    });
    
    // Get all wardrobe items
    const allItems = await prisma.wardrobeItem.findMany();
    const wardrobeItems: WardrobeItem[] = allItems.map(toWardrobeItem);
    
    // Generate 2-3 outfit recommendations
    const outfits: Outfit[] = [];
    
    // Outfit 1: Try to match formality and comfort
    const outfit1Items = [
      wardrobeItems.find(item => 
        item.category === 'top' && 
        item.tags.some((tag: string) => tag.includes(validatedRequest.formality.split('-')[0]))
      ),
      wardrobeItems.find(item => 
        item.category === 'bottom' && 
        item.tags.some((tag: string) => tag.includes(validatedRequest.formality.split('-')[0]))
      ),
      wardrobeItems.find(item => item.category === 'shoes'),
    ].filter(Boolean) as WardrobeItem[];
    
    if (outfit1Items.length >= 2) {
      const score1 = scoreOutfit(outfit1Items, validatedRequest);
      const outfit1 = await prisma.outfit.create({
        data: {
          requestId: storedRequest.id,
          score: score1,
          rationale: generateRationale(outfit1Items, validatedRequest, score1),
        },
      });
      
      for (const item of outfit1Items) {
        await prisma.outfitItem.create({
          data: {
            outfitId: outfit1.id,
            wardrobeItemId: item.id,
          },
        });
      }
      
      outfits.push({
        id: outfit1.id,
        items: outfit1Items,
        score: score1,
        rationale: outfit1.rationale,
      });
    }
    
    // Outfit 2: Alternative combination
    const outfit2Items = [
      wardrobeItems.find(item => 
        item.category === 'top' && 
        !outfit1Items.some(i => i.id === item.id)
      ),
      wardrobeItems.find(item => 
        item.category === 'bottom' && 
        !outfit1Items.some(i => i.id === item.id)
      ),
      wardrobeItems.find(item => 
        item.category === 'shoes' && 
        !outfit1Items.some(i => i.id === item.id)
      ),
    ].filter(Boolean) as WardrobeItem[];
    
    if (outfit2Items.length >= 2) {
      const score2 = scoreOutfit(outfit2Items, validatedRequest);
      const outfit2 = await prisma.outfit.create({
        data: {
          requestId: storedRequest.id,
          score: score2,
          rationale: generateRationale(outfit2Items, validatedRequest, score2),
        },
      });
      
      for (const item of outfit2Items) {
        await prisma.outfitItem.create({
          data: {
            outfitId: outfit2.id,
            wardrobeItemId: item.id,
          },
        });
      }
      
      outfits.push({
        id: outfit2.id,
        items: outfit2Items,
        score: score2,
        rationale: outfit2.rationale,
      });
    }
    
    // Outfit 3: Comfort-focused if high comfort requested
    if (validatedRequest.comfort >= 7) {
      const outfit3Items = wardrobeItems
        .filter(item => item.tags.includes('comfortable'))
        .slice(0, 3);
      
      if (outfit3Items.length >= 2) {
        const score3 = scoreOutfit(outfit3Items, validatedRequest);
        const outfit3 = await prisma.outfit.create({
          data: {
            requestId: storedRequest.id,
            score: score3,
            rationale: generateRationale(outfit3Items, validatedRequest, score3),
          },
        });
        
        for (const item of outfit3Items) {
          await prisma.outfitItem.create({
            data: {
              outfitId: outfit3.id,
              wardrobeItemId: item.id,
            },
          });
        }
        
        outfits.push({
          id: outfit3.id,
          items: outfit3Items,
          score: score3,
          rationale: outfit3.rationale,
        });
      }
    }
    
    // Ensure we have at least 2 outfits
    if (outfits.length < 2) {
      // Add a random outfit
      const randomItems = wardrobeItems.slice(0, 3);
      if (randomItems.length >= 2) {
        const scoreRandom = scoreOutfit(randomItems, validatedRequest);
        const outfitRandom = await prisma.outfit.create({
          data: {
            requestId: storedRequest.id,
            score: scoreRandom,
            rationale: generateRationale(randomItems, validatedRequest, scoreRandom),
          },
        });
        
        for (const item of randomItems) {
          await prisma.outfitItem.create({
            data: {
              outfitId: outfitRandom.id,
              wardrobeItemId: item.id,
            },
          });
        }
        
        outfits.push({
          id: outfitRandom.id,
          items: randomItems,
          score: scoreRandom,
          rationale: outfitRandom.rationale,
        });
      }
    }
    
    res.json({
      outfits: outfits.slice(0, 3),
      requestId: storedRequest.id,
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Feedback endpoint
app.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    const validatedFeedback = CreateFeedbackSchema.parse(req.body);
    
    const feedback = await prisma.feedback.create({
      data: validatedFeedback,
    });
    
    res.status(201).json(feedback);
  } catch (error: any) {
    console.error('Error creating feedback:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

// Get feedback history
app.get('/api/feedback', async (_req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        request: true,
        outfit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get recommendation history
app.get('/api/recommendations/history', async (_req: Request, res: Response) => {
  try {
    const requests = await prisma.recommendationRequest.findMany({
      include: {
        outfits: {
          include: {
            items: {
              include: {
                wardrobeItem: true,
              },
            },
          },
        },
        feedbacks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedRequests = requests.map(req => ({
      ...req,
      constraints: JSON.parse(req.constraints),
      outfits: req.outfits.map(outfit => ({
        ...outfit,
        items: outfit.items.map(item => toWardrobeItem(item.wardrobeItem)),
      })),
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching recommendation history:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation history' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
