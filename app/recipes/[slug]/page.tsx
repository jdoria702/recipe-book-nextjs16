import React from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { IRecipe } from '@/database/recipe.model'

interface PageProps {
  params: Promise<{ slug: string }>
}

const RecipePage = async ({ params }: PageProps) => {
  // Await params in Next.js 15+
  const { slug } = await params;

  // Build safe base URL with fallbacks
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  if (!baseUrl) {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 
                     (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    
    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else {
      baseUrl = 'http://localhost:3000';
    }
  }

  // Fetch recipe from API
  let recipe: IRecipe;
  try {
    const response = await fetch(`${baseUrl}/api/recipes/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch recipe: ${response.statusText}`);
    }

    const data = await response.json();
    recipe = data.recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    notFound();
  }

  // Capitalize first letter of type
  const typeDisplay = recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1);

  return (
    <article className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        ← Back to Recipes
      </Link>

      {/* Header Section */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="pill">{typeDisplay}</span>
        </div>
        <h1 className="text-4xl md:text-5xl mb-4">{recipe.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{recipe.description}</p>
      </header>

      {/* Hero Image */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-10 card-shadow">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-10">
        {/* Left Column - Ingredients & Equipment */}
        <div className="md:col-span-1 space-y-8">
          {/* Ingredients Section */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
            <ul className="space-y-2 list-none">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span className="text-foreground">{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Equipment Section */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4">Equipment</h2>
            <ul className="space-y-2 list-none">
              {recipe.equipment.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column - Instructions */}
        <div className="md:col-span-2">
          <section className="bg-card rounded-lg p-6 md:p-8 border border-border">
            <h2 className="text-2xl font-semibold mb-6">Instructions</h2>
            <ol className="space-y-4 list-none">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-foreground leading-relaxed pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {/* Notes & Nutrition Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Notes Section */}
        <section className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">Notes</h2>
          <ul className="space-y-3 list-none">
            {recipe.notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-accent mt-1.5">💡</span>
                <span className="text-foreground leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Nutrition Section */}
        <section className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">Nutrition</h2>
          <ul className="space-y-2 list-none">
            {recipe.nutrition.map((info, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-secondary mt-1.5">•</span>
                <span className="text-foreground">{info}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center pt-6 border-t border-border">
        <Link href="/" className="button">
          Back to All Recipes
        </Link>
      </div>
    </article>
  )
}

export default RecipePage

