# Mirisni arhiv – Supabase postavljanje

1. Na https://supabase.com/dashboard napravi projekt.
2. Authentication → Users → Add user: napravi svoj korisnički račun i potvrdi email.
3. Kopiraj **User UID** tog računa, zamijeni `PASTE_YOUR_AUTH_USER_UUID_HERE` u `supabase_setup.sql` i pokreni SQL u Supabase SQL Editoru.
4. Project Settings → API Keys: uzmi **anon/publishable** ključ (nikad `service_role`/secret ključ). U `js/config.js` upiši Project URL i anon ključ.
5. Objavi sve datoteke na GitHub Pages. Klikni `Prijava vlasnika` i prijavi se. Pri prvoj prijavi potvrdi objavu početnog kataloga.
6. Provjeri u Supabase Table Editoru da tablica `catalog_state` ima zapis ID 1. Nakon toga svi posjetitelji vide online izmjene.

## Sigurnost
RLS dopušta pisanje samo autentificiranom korisniku čiji UID je naveden u SQL funkciji. Nema PIN-a ili lozinke u javnom kodu. Anon ključ smije biti javan; `service_role` ne smije.

## Slike
Slike iz mape `assets/` rade normalno. Učitavanje nove slike u uređivaču trenutno pohranjuje optimizirani base64 u JSON baze; kod većih količina slika preporuča se Supabase Storage.

## Trenutno stanje
Dok ne spojiš Supabase, javni katalog radi read-only iz ugrađenog `js/data.js`. Nakon povezivanja i prve objave koristi se online baza. Ocjene i statusi nisu automatski mijenjani.
