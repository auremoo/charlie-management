-- ============================================================
-- Migration : Fix infinite RLS recursion between pets <-> pet_sitters
-- Copier-coller dans Supabase > SQL Editor > Run
-- ============================================================

-- 1. Créer la fonction helper manquante
create or replace function is_pet_sitter(p_pet_id uuid)
returns boolean as $$
begin
  return exists (select 1 from pet_sitters where pet_id = p_pet_id and sitter_id = auth.uid());
end;
$$ language plpgsql security definer;

-- Recréer has_pet_access pour utiliser les fonctions au lieu de requêtes directes
create or replace function has_pet_access(p_pet_id uuid)
returns boolean as $$
begin
  return is_pet_owner(p_pet_id) or is_pet_sitter(p_pet_id);
end;
$$ language plpgsql security definer;

-- 2. Remplacer les policies qui causent la récursion

-- pets_sitter_select : exists(pet_sitters) → is_pet_sitter()
drop policy if exists "pets_sitter_select" on pets;
create policy "pets_sitter_select" on pets for select using (is_pet_sitter(id));

-- pet_sitters_owner_all : exists(pets) → is_pet_owner()
drop policy if exists "pet_sitters_owner_all" on pet_sitters;
create policy "pet_sitters_owner_all" on pet_sitters for all using (is_pet_owner(pet_id));

-- invite_codes_owner_all : exists(pets) → is_pet_owner()
drop policy if exists "invite_codes_owner_all" on invite_codes;
create policy "invite_codes_owner_all" on invite_codes for all using (is_pet_owner(pet_id));
