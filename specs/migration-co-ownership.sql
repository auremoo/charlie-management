-- ============================================================
-- Migration : Support co-ownership (multiple owners per pet)
-- Copier-coller dans Supabase > SQL Editor > Run
-- ============================================================

-- 1. Add role column to pet_sitters (default 'sitter', can be 'owner')
alter table pet_sitters add column if not exists role text not null default 'sitter'
  check (role in ('sitter', 'owner'));

-- 2. Add role column to invite_codes (so the invite carries the intended role)
alter table invite_codes add column if not exists role text not null default 'sitter'
  check (role in ('sitter', 'owner'));

-- 3. Update is_pet_owner to include co-owners from pet_sitters
create or replace function is_pet_owner(p_pet_id uuid)
returns boolean as $$
begin
  return exists (select 1 from pets where id = p_pet_id and owner_id = auth.uid())
      or exists (select 1 from pet_sitters where pet_id = p_pet_id and sitter_id = auth.uid() and role = 'owner');
end;
$$ language plpgsql security definer;

-- 4. Update has_pet_access (unchanged logic, but redefine for consistency)
create or replace function has_pet_access(p_pet_id uuid)
returns boolean as $$
begin
  return is_pet_owner(p_pet_id) or is_pet_sitter(p_pet_id);
end;
$$ language plpgsql security definer;
