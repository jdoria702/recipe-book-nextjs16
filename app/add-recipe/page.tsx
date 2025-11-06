'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddRecipePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'dessert',
    description: '',
    ingredients: [''],
    equipment: [''],
    instructions: [''],
    notes: [''],
    nutrition: [''],
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const initialFormDataRef = useRef<string | null>(null)
  const initialImageFileRef = useRef<File | null>(null)
  const historyStatePushedRef = useRef(false)

  // Initialize initial form data on mount
  useEffect(() => {
    if (initialFormDataRef.current === null) {
      initialFormDataRef.current = JSON.stringify(formData)
      initialImageFileRef.current = imageFile
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track form changes
  useEffect(() => {
    if (initialFormDataRef.current === null) return
    
    const currentFormData = JSON.stringify(formData)
    const hasFormChanged = currentFormData !== initialFormDataRef.current
    const hasImageChanged = imageFile !== initialImageFileRef.current
    setHasUnsavedChanges(hasFormChanged || hasImageChanged)
  }, [formData, imageFile])

  // Set up history state for back button detection (only once on mount)
  useEffect(() => {
    if (!historyStatePushedRef.current) {
      // Add a state to the history stack so we can detect back navigation
      window.history.pushState(null, '', window.location.href)
      historyStatePushedRef.current = true
    }
  }, [])

  // Handle browser navigation (back/forward, closing tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '' // Required for Chrome
        return '' // Required for some browsers
      }
    }

    // Handle browser back/forward button
    const handlePopState = () => {
      if (hasUnsavedChanges) {
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href)
        
        // Show confirmation dialog
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this page?')
        if (confirmed) {
          setHasUnsavedChanges(false)
          // Navigate back after confirmation
          window.history.back()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedChanges])

  // Handle Next.js router navigation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this page?')
      if (confirmed) {
        setHasUnsavedChanges(false)
        router.push(href)
      }
    }
  }

  // Handle array field changes
  const updateArrayField = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) =>
        i === index ? value : item
      ),
    }))
  }

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), ''],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_: string, i: number) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required')
      }
      if (!imageFile) {
        throw new Error('Image is required')
      }
      if (formData.ingredients.filter(i => i.trim()).length === 0) {
        throw new Error('At least one ingredient is required')
      }
      if (formData.equipment.filter(e => e.trim()).length === 0) {
        throw new Error('At least one equipment item is required')
      }
      if (formData.instructions.filter(i => i.trim()).length === 0) {
        throw new Error('At least one instruction is required')
      }
      if (formData.notes.filter(n => n.trim()).length === 0) {
        throw new Error('At least one note is required')
      }
      if (formData.nutrition.filter(n => n.trim()).length === 0) {
        throw new Error('At least one nutrition item is required')
      }

      // Prepare FormData
      const submitData = new FormData()
      submitData.append('title', formData.title.trim())
      submitData.append('type', formData.type)
      submitData.append('description', formData.description.trim())
      submitData.append('image', imageFile)
      
      // Filter out empty items and append as JSON
      submitData.append('ingredients', JSON.stringify(formData.ingredients.filter(i => i.trim())))
      submitData.append('equipment', JSON.stringify(formData.equipment.filter(e => e.trim())))
      submitData.append('instructions', JSON.stringify(formData.instructions.filter(i => i.trim())))
      submitData.append('notes', JSON.stringify(formData.notes.filter(n => n.trim())))
      submitData.append('nutrition', JSON.stringify(formData.nutrition.filter(n => n.trim())))

      // Submit to API
      const response = await fetch('/api/recipes', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create recipe')
      }

      setSuccess(true)
      setHasUnsavedChanges(false) // Clear unsaved changes flag on success
      
      // Redirect to the new recipe page after a short delay
      setTimeout(() => {
        const slug = data.recipe?.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        router.push(`/recipes/${slug}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/" 
        onClick={(e) => handleNavigation(e, '/')}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        ← Back to Recipes
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl mb-4">Add Your Recipe</h1>
        <p className="text-lg text-muted-foreground">
          Share your favorite recipe with the community
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Success Message */}
        {success && (
          <div className="bg-secondary/20 border border-secondary text-secondary-foreground rounded-lg p-4">
            Recipe created successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground rounded-lg p-4">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <section className="bg-card rounded-lg p-6 border border-border space-y-6">
          <h2 className="text-2xl font-semibold">Basic Information</h2>
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Recipe Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as typeof formData.type }))}
              className="w-full px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-2">
              Recipe Image *
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            {imageFile && (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
        </section>

        {/* Ingredients */}
        <section className="bg-card rounded-lg p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Ingredients *</h2>
            <button
              type="button"
              onClick={() => addArrayItem('ingredients')}
              className="text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md font-medium"
            >
              + Add Ingredient
            </button>
          </div>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateArrayField('ingredients', index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('ingredients', index)}
                  className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Equipment */}
        <section className="bg-card rounded-lg p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Equipment *</h2>
            <button
              type="button"
              onClick={() => addArrayItem('equipment')}
              className="text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md font-medium"
            >
              + Add Equipment
            </button>
          </div>
          {formData.equipment.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayField('equipment', index, e.target.value)}
                placeholder={`Equipment ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {formData.equipment.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('equipment', index)}
                  className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Instructions */}
        <section className="bg-card rounded-lg p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Instructions *</h2>
            <button
              type="button"
              onClick={() => addArrayItem('instructions')}
              className="text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md font-medium"
            >
              + Add Step
            </button>
          </div>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1 flex gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mt-2">
                  {index + 1}
                </span>
                <textarea
                  value={instruction}
                  onChange={(e) => updateArrayField('instructions', index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                  className="flex-1 px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              {formData.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('instructions', index)}
                  className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md self-start"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Notes */}
        <section className="bg-card rounded-lg p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Notes *</h2>
            <button
              type="button"
              onClick={() => addArrayItem('notes')}
              className="text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md font-medium"
            >
              + Add Note
            </button>
          </div>
          {formData.notes.map((note, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={note}
                onChange={(e) => updateArrayField('notes', index, e.target.value)}
                placeholder={`Note ${index + 1}`}
                rows={2}
                className="flex-1 px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {formData.notes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('notes', index)}
                  className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md self-start"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Nutrition */}
        <section className="bg-card rounded-lg p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Nutrition Information *</h2>
            <button
              type="button"
              onClick={() => addArrayItem('nutrition')}
              className="text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md font-medium"
            >
              + Add Item
            </button>
          </div>
          {formData.nutrition.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayField('nutrition', index, e.target.value)}
                placeholder={`e.g., Calories: 250, Protein: 15g`}
                className="flex-1 px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {formData.nutrition.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('nutrition', index)}
                  className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/"
            onClick={(e) => handleNavigation(e, '/')}
            className="px-6 py-2 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Recipe...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  )
}

