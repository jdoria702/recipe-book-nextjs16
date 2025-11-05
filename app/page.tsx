import React from 'react'
import { SAMPLE_RECIPES } from '@/lib/recipes'
import RecipeCard from '@/components/RecipeCard';
import { IRecipe } from '@/database/recipe.model';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Home = async () => {
  const response = await fetch(`${BASE_URL}/api/recipes`)
  const { recipes } = await response.json();
  return (
    <section>
      <h1 className="text-center">Your Recipes, All in One</h1>
      <p className="text-center mt-5">View the catalog from recipes you'll want to create</p>
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