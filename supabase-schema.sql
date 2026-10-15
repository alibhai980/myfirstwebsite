-- ========================================================
-- ALIZONE E-COMMERCE - SUPABASE DATABASE SCHEMA & RLS
-- ========================================================

-- 1. PROFILES TABLE (Customer, Seller, Admin)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text,
    full_name text,
    phone text,
    city text,
    role text default 'customer' check (role in ('customer', 'seller', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SELLER APPLICATIONS TABLE (Status strictly defaults to 'pending')
create table if not exists public.seller_applications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    shop_name text not null,
    phone text not null,
    email text not null,
    address text not null,
    category text,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SELLERS TABLE (Approved Sellers only)
create table if not exists public.sellers (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade unique not null,
    shop_name text not null,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PRODUCTS TABLE (Connected to sellers)
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    seller_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    category text not null,
    price numeric not null check (price >= 0),
    original_price numeric check (original_price >= 0),
    image_url text default 'laptop.jpg',
    rating numeric default 5.0,
    reviews_count integer default 0,
    stock integer default 10,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS TABLE (Customer orders)
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    order_number text unique not null,
    customer_id uuid references auth.users(id) on delete set null,
    customer_name text not null,
    customer_phone text not null,
    delivery_address text not null,
    city text not null,
    payment_method text not null,
    total_amount numeric not null,
    items jsonb not null,
    status text default 'processing',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.seller_applications enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- PROFILES POLICIES
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- SELLER APPLICATIONS POLICIES
create policy "Users can view their own seller application"
    on public.seller_applications for select
    using (auth.uid() = user_id);

create policy "Users can submit seller application"
    on public.seller_applications for insert
    with check (auth.uid() = user_id and status = 'pending');

-- SELLERS POLICIES
create policy "Public can view approved sellers"
    on public.sellers for select
    using (true);

-- PRODUCTS POLICIES
create policy "Anyone can view active products"
    on public.products for select
    using (is_active = true);

create policy "Sellers can view their own products"
    on public.products for select
    using (auth.uid() = seller_id);

create policy "Sellers can insert their own products"
    on public.products for insert
    with check (auth.uid() = seller_id);

create policy "Sellers can update their own products"
    on public.products for update
    using (auth.uid() = seller_id);

create policy "Sellers can delete their own products"
    on public.products for delete
    using (auth.uid() = seller_id);

-- ORDERS POLICIES
create policy "Customers can view their own orders"
    on public.orders for select
    using (auth.uid() = customer_id);

create policy "Authenticated users can place orders"
    on public.orders for insert
    with check (auth.uid() = customer_id);

-- ========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ========================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'role', 'customer')
    );
    return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
