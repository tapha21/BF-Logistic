-- Crée le compte de connexion admin@gmail.com / 1234 directement en base.
-- À exécuter une fois dans Supabase Dashboard > SQL Editor > New query.
-- Ne pas relancer si le compte existe déjà (supprimez-le d'abord via
-- Authentication > Users, ou changez l'email ci-dessous).

with new_user as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('1234', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Baba Faty","role":"Administrateur"}',
    now(), now(),
    '', '', '', ''
  )
  returning id
)
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  id,
  id::text,
  jsonb_build_object('sub', id::text, 'email', 'admin@gmail.com'),
  'email',
  now(), now(), now()
from new_user;
