-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- recipes ----------
create table if not exists public.recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cuisine text,
  ingredients jsonb default '[]'::jsonb,
  instructions text,
  prep_time int,
  cook_time int,
  servings int,
  calories int,
  image_url text,
  source text default 'manual', -- 'manual' | 'ai'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.recipes enable row level security;

create policy "Recipes are viewable by owner"
  on public.recipes for select
  using (auth.uid() = user_id);

create policy "Recipes are insertable by owner"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Recipes are updatable by owner"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "Recipes are deletable by owner"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- ---------- favorites ----------
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, recipe_id)
);

alter table public.favorites enable row level security;

create policy "Favorites are viewable by owner"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Favorites are insertable by owner"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Favorites are deletable by owner"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ---------- meal_plans ----------
create table if not exists public.meal_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  week_start date,
  created_at timestamptz default now()
);

alter table public.meal_plans enable row level security;

create policy "Meal plans are viewable by owner"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "Meal plans are insertable by owner"
  on public.meal_plans for insert
  with check (auth.uid() = user_id);

create policy "Meal plans are updatable by owner"
  on public.meal_plans for update
  using (auth.uid() = user_id);

create policy "Meal plans are deletable by owner"
  on public.meal_plans for delete
  using (auth.uid() = user_id);

-- ---------- meal_plan_items ----------
create table if not exists public.meal_plan_items (
  id uuid primary key default uuid_generate_v4(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  day_of_week int not null, -- 0=Mon .. 6=Sun
  meal_type text not null,  -- 'breakfast' | 'lunch' | 'dinner'
  created_at timestamptz default now()
);

alter table public.meal_plan_items enable row level security;

-- Ownership flows through the parent meal_plan's user_id.
create policy "Meal plan items are viewable via parent plan"
  on public.meal_plan_items for select
  using (exists (
    select 1 from public.meal_plans mp
    where mp.id = meal_plan_id and mp.user_id = auth.uid()
  ));

create policy "Meal plan items are insertable via parent plan"
  on public.meal_plan_items for insert
  with check (exists (
    select 1 from public.meal_plans mp
    where mp.id = meal_plan_id and mp.user_id = auth.uid()
  ));

create policy "Meal plan items are deletable via parent plan"
  on public.meal_plan_items for delete
  using (exists (
    select 1 from public.meal_plans mp
    where mp.id = meal_plan_id and mp.user_id = auth.uid()
  ));

-- Helpful indexes
create index if not exists recipes_user_id_idx on public.recipes(user_id);
create index if not exists meal_plans_user_id_idx on public.meal_plans(user_id);
create index if not exists meal_plan_items_plan_id_idx on public.meal_plan_items(meal_plan_id);
