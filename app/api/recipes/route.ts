import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Recipe from '@/database/recipe.model';

/**
 * GET /api/recipes
 * Retrieves all recipes from the database
 * 
 * @returns JSON array of all recipes
 */
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Fetch all recipes, sorted by most recent first
    const recipes = await Recipe.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: recipes.length,
        data: recipes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching recipes:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recipes',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes
 * Creates a new recipe in the database
 * 
 * @param request - Next.js request object containing recipe data
 * @returns JSON response with created recipe or error
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'title',
      'type',
      'image',
      'description',
      'ingredients',
      'equipment',
      'instructions',
      'notes',
      'nutrition',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate array fields are non-empty
    const arrayFields = ['ingredients', 'equipment', 'instructions', 'notes', 'nutrition'];
    for (const field of arrayFields) {
      if (!Array.isArray(body[field]) || body[field].length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} must be a non-empty array`,
          },
          { status: 400 }
        );
      }
    }

    // Validate type enum
    const validTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Type must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create new recipe
    const recipe = await Recipe.create(body);

    return NextResponse.json(
      {
        success: true,
        data: recipe,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recipe:', error);

    // Handle duplicate slug error
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'A recipe with this title already exists',
        },
        { status: 409 }
      );
    }

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create recipe',
      },
      { status: 500 }
    );
  }
}