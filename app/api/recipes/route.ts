import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Recipe from '@/database/recipe.model';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    let recipeData;

    try {
      recipeData = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid form data format' },
        { status: 400 }
      );
    }

    // --- Handle file upload ---
    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'Recipes' },
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      ).end(buffer);
    });

    recipeData.image = (uploadResult as { secure_url: string }).secure_url;

    // --- Parse and validate JSON fields ---
    const arrayFields = ['ingredients', 'equipment', 'instructions', 'notes', 'nutrition'];

    for (const field of arrayFields) {
      const rawValue = formData.get(field);
      if (!rawValue) {
        return NextResponse.json(
          { message: `${field} field is required` },
          { status: 400 }
        );
      }

      try {
        recipeData[field] = JSON.parse(rawValue as string);
      } catch (e) {
        return NextResponse.json(
          {
            message: `Invalid JSON for ${field}`,
            error: e instanceof Error ? e.message : 'Parse error',
          },
          { status: 400 }
        );
      }

      if (!Array.isArray(recipeData[field])) {
        return NextResponse.json(
          { message: `${field} must be an array` },
          { status: 400 }
        );
      }
    }

    // --- Validate type field ---
    const validTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];
    if (!validTypes.includes(recipeData.type)) {
      return NextResponse.json(
        { message: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // --- Create recipe in MongoDB ---
    const createdRecipe = await Recipe.create(recipeData);

    return NextResponse.json(
      { message: 'Recipe created successfully', recipe: createdRecipe },
      { status: 201 }
    );
  } catch (e) {
    console.error('Recipe creation failed:', e);
    return NextResponse.json(
      {
        message: 'Recipe creation failed',
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const recipes = await Recipe.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: 'Recipes fetched successfully', recipes },
      { status: 200 }
    );
  } catch (e) {
    console.error('Error fetching recipes:', e);
    return NextResponse.json(
      { message: 'Failed to fetch recipes', error: e },
      { status: 400 }
    );
  }
}
