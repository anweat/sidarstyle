import { z } from 'zod';

export const WARDROBE_CATEGORIES = [
  'top',
  'bottom',
  'shoes',
  'accessory',
  'outerwear',
] as const;

export const WARDROBE_SEASONS = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'all-season',
] as const;

export const WARDROBE_STYLES = [
  'casual',
  'business',
  'formal',
  'sporty',
  'street',
  'vintage',
  'outdoor',
] as const;

export const WARDROBE_OCCASIONS = [
  'daily',
  'work',
  'date',
  'party',
  'travel',
  'fitness',
  'formal-event',
] as const;

export const WARDROBE_PATTERNS = [
  'solid',
  'striped',
  'plaid',
  'floral',
  'graphic',
  'polka-dot',
  'other',
] as const;

export const WARDROBE_FITS = [
  'slim',
  'regular',
  'loose',
  'oversized',
] as const;

export const WARDROBE_CONDITIONS = [
  'new',
  'good',
  'worn',
] as const;

export const WardrobeCategoryEnum = z.enum(WARDROBE_CATEGORIES);
export const WardrobeSeasonEnum = z.enum(WARDROBE_SEASONS);
export const WardrobeStyleEnum = z.enum(WARDROBE_STYLES);
export const WardrobeOccasionEnum = z.enum(WARDROBE_OCCASIONS);
export const WardrobePatternEnum = z.enum(WARDROBE_PATTERNS);
export const WardrobeFitEnum = z.enum(WARDROBE_FITS);
export const WardrobeConditionEnum = z.enum(WARDROBE_CONDITIONS);

// Wardrobe Item Schema
export const WardrobeItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: WardrobeCategoryEnum,
  subcategory: z.string().optional(),
  color: z.string(),
  brand: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  pattern: WardrobePatternEnum.optional(),
  fit: WardrobeFitEnum.optional(),
  season: z.array(WardrobeSeasonEnum).default([]),
  style: z.array(WardrobeStyleEnum).default([]),
  occasion: z.array(WardrobeOccasionEnum).default([]),
  condition: WardrobeConditionEnum.optional(),
  warmth: z.number().int().min(1).max(5).optional(),
  waterproof: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type WardrobeItem = z.infer<typeof WardrobeItemSchema>;
export type WardrobeCategory = z.infer<typeof WardrobeCategoryEnum>;
export type WardrobeSeason = z.infer<typeof WardrobeSeasonEnum>;
export type WardrobeStyle = z.infer<typeof WardrobeStyleEnum>;
export type WardrobeOccasion = z.infer<typeof WardrobeOccasionEnum>;
export type WardrobePattern = z.infer<typeof WardrobePatternEnum>;
export type WardrobeFit = z.infer<typeof WardrobeFitEnum>;
export type WardrobeCondition = z.infer<typeof WardrobeConditionEnum>;

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
