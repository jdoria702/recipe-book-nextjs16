import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Recipe document
export interface IRecipe extends Document {
  title: string;
  slug: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'dessert';
  image: string;
  description: string;
  ingredients: string[];
  equipment: string[];
  instructions: string[];
  notes: string[];
  nutrition: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Recipe schema definition
const RecipeSchema = new Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Recipe type is required'],
      enum: {
        values: ['breakfast', 'lunch', 'dinner', 'dessert'],
        message: 'Type must be breakfast, lunch, dinner, or dessert',
      },
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      minlength: [1, 'Image URL cannot be empty'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description cannot be empty'],
    },
    ingredients: {
      type: [String],
      required: [true, 'Ingredients are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one ingredient is required',
      },
    },
    equipment: {
      type: [String],
      required: [true, 'Equipment is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one piece of equipment is required',
      },
    },
    instructions: {
      type: [String],
      required: [true, 'Instructions are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one instruction is required',
      },
    },
    notes: {
      type: [String],
      required: [true, 'Notes are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one note is required',
      },
    },
    nutrition: {
      type: [String],
      required: [true, 'Nutrition information is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one nutrition item is required',
      },
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true,
  }
);

/**
 * Pre-save hook to generate URL-friendly slug from title
 * Only regenerates if the title has been modified
 */
RecipeSchema.pre('save', function (next) {
  const recipe = this as IRecipe;

  // Only generate slug if title has changed or is new
  if (recipe.isModified('title')) {
    recipe.slug = generateSlug(recipe.title);
  }

  next();
});

/**
 * Generates a URL-friendly slug from a title string
 * Converts to lowercase, removes special characters, and replaces spaces with hyphens
 * 
 * @param title - The recipe title to convert
 * @returns URL-friendly slug string
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Create unique index on slug for fast lookups and uniqueness enforcement
RecipeSchema.index({ slug: 1 }, { unique: true });

// Prevent model recompilation in development (Next.js hot reload)
const Recipe: Model<IRecipe> =
  mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
