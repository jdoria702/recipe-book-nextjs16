import React from 'react'
import { SAMPLE_RECIPES } from '@/lib/recipes'
import RecipeCard from '@/components/RecipeCard';

const Home = () => {
  return (
    <section>
      <h1 className="text-center">Your Recipes, All in One</h1>
      <p className="text-center mt-5">View the catalog from recipes you'll want to create</p>
      <div className="mt-20 space-y-7">
        <h3>Favorites</h3>
        <ul className="recipes">
          {SAMPLE_RECIPES.map((recipe) => (
            <RecipeCard key={recipe.slug} {...recipe} />
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Home