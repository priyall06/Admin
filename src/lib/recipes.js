import { supabase } from "./supabaseClient";

// ---------- Recipes: Create, Read, Update, Delete ----------

export async function listRecipes(userId) {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getRecipe(id) {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createRecipe(userId, recipe) {
  const { data, error } = await supabase
    .from("recipes")
    .insert([{ ...recipe, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRecipe(id, updates) {
  const { data, error } = await supabase
    .from("recipes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRecipe(id) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Favorites ----------

export async function toggleFavorite(userId, recipeId, isFavorite) {
  if (isFavorite) {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("recipe_id", recipeId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("favorites").insert([{ user_id: userId, recipe_id: recipeId }]);
  if (error) throw error;
  return true;
}

export async function listFavoriteIds(userId) {
  const { data, error } = await supabase.from("favorites").select("recipe_id").eq("user_id", userId);
  if (error) throw error;
  return data.map((f) => f.recipe_id);
}

// ---------- Meal Plans ----------

export async function listMealPlans(userId) {
  const { data, error } = await supabase
    .from("meal_plans")
    .select("*, meal_plan_items(*, recipes(id, title, calories, prep_time))")
    .eq("user_id", userId)
    .order("week_start", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createMealPlan(userId, title, weekStart) {
  const { data, error } = await supabase
    .from("meal_plans")
    .insert([{ user_id: userId, title, week_start: weekStart }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addMealPlanItem(mealPlanId, recipeId, dayOfWeek, mealType) {
  const { data, error } = await supabase
    .from("meal_plan_items")
    .insert([{ meal_plan_id: mealPlanId, recipe_id: recipeId, day_of_week: dayOfWeek, meal_type: mealType }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMealPlanItem(id) {
  const { error } = await supabase.from("meal_plan_items").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteMealPlan(id) {
  const { error } = await supabase.from("meal_plans").delete().eq("id", id);
  if (error) throw error;
}
