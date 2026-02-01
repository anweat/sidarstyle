import { z } from 'zod';

// Wardrobe Item Schema
export const WardrobeItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.enum(['top', 'bottom', 'shoes', 'accessory', 'outerwear']),
  color: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type WardrobeItem = z.infer<typeof WardrobeItemSchema>;

export const CreateWardrobeItemSchema = WardrobeItemSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type CreateWardrobeItem = z.infer<typeof CreateWardrobeItemSchema>;

// Recommendation Request Schema
export const RecommendationRequestSchema = z.object({
  occasion: z.string().min(1),
  style: z.string().min(1),
  formality: z.enum(['casual', 'business-casual', 'formal', 'semi-formal']),
  comfort: z.number().min(1).max(10),
  budget: z.enum(['low', 'medium', 'high', 'any']),
  constraints: z.array(z.string()).optional(),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;

// Outfit Schema
export const OutfitSchema = z.object({
  id: z.string(),
  items: z.array(WardrobeItemSchema),
  score: z.number().min(0).max(100),
  rationale: z.string(),
});

export type Outfit = z.infer<typeof OutfitSchema>;

// Recommendation Response Schema
export const RecommendationResponseSchema = z.object({
  outfits: z.array(OutfitSchema).min(2).max(3),
  requestId: z.string(),
});

export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;

// Feedback Schema
export const FeedbackSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  outfitId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  selected: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export const CreateFeedbackSchema = FeedbackSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type CreateFeedback = z.infer<typeof CreateFeedbackSchema>;
