import React from 'react'
import { headers } from 'next/headers'
import { SAMPLE_RECIPES } from '@/lib/recipes'
import RecipeCard from '@/components/RecipeCard';
import { IRecipe } from '@/database/recipe.model';

const Home = async () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined);
  if (!baseUrl) {
    throw new Error('Base URL is not configured');
  }
  
  const response = await fetch(`${baseUrl}/api/recipes`, {
    cache: 'no-store'
  })
  const { recipes } = await response.json();
  return (
    <section>
      <h1 className="text-center">Your Recipes, All in One</h1>
      <p className="text-center mt-5">View the catalog from recipes you&apos;ll want to create</p>
      <div className="mt-20 space-y-7">
        <h3>Favorites</h3>
        <ul className="recipes">
          {recipes && recipes.length > 0 && recipes.map((recipe: IRecipe) => (
            <li key={recipe.title} className="list-none">
              <RecipeCard { ...recipe } />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Home