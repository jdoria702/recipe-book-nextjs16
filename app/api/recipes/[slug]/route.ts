import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Recipe from '@/database/recipe.model';

/**
 * Validates a slug parameter
 * Slugs should be lowercase, alphanumeric with hyphens, and non-empty
 * 
 * @param slug - The slug string to validate
 * @returns Object with isValid boolean and error message if invalid
 */
function validateSlug(slug: string): { isValid: boolean; error?: string } {
  // Check if slug is provided and is a string
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'Slug parameter is required and must be a string' };
  }

  // Check if slug is empty after trimming
  const trimmedSlug = slug.trim();
  if (trimmedSlug.length === 0) {
    return { isValid: false, error: 'Slug cannot be empty' };
  }

  // Check if slug matches the expected pattern (lowercase alphanumeric with hyphens)
  // Allow lowercase letters, numbers, and hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(trimmedSlug)) {
    return { 
      isValid: false, 
      error: 'Slug must contain only lowercase letters, numbers, and hyphens. Multiple consecutive hyphens are not allowed.' 
    };
  }

  // Check length (reasonable limits)
  if (trimmedSlug.length > 200) {
    return { isValid: false, error: 'Slug is too long (maximum 200 characters)' };
  }

  return { isValid: true };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { slug } = await params;

    // Validate the slug parameter
    const validation = validateSlug(slug);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find recipe by slug (case-insensitive search, but slugs are stored lowercase)
    const recipe = await Recipe.findOne({ slug: slug.toLowerCase().trim() });

    // If recipe not found, return 404
    if (!recipe) {
      return NextResponse.json(
        { message: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Return the recipe
    return NextResponse.json(
      { message: 'Recipe fetched successfully', recipe },
      { status: 200 }
    );
  } catch (e) {
    console.error('Error fetching recipe by slug:', e);
    return NextResponse.json(
      {
        message: 'Failed to fetch recipe',
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
