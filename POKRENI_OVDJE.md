# Mirisni arhiv – dovršetak Supabase povezivanja

Stranica i sva evidencija su pripremljeni. Za aktivaciju je nužan **tvoj** Supabase projekt. Ne stavljaj lozinku niti secret/service_role ključ u GitHub.

## 1. Supabase – napravi vlasnički račun

1. Otvori https://supabase.com/dashboard i uđi u svoj projekt (ili napravi novi `mirisni-arhiv`).
2. U **Authentication → Users** stvori svog korisnika (email + jaka lozinka). Ako koristiš **Add user**, odaberi opciju potvrđenog emaila kada je dostupna.
3. Kopiraj **User UID** (UUID). To nije lozinka.
4. Po želji u **Authentication → Providers → Email** isključi javne registracije ako ih ne trebaš. Ključna zaštita pisanja su RLS pravila ispod, ne ova postavka.

## 2. Baza i prava

1. U ovom paketu otvori `supabase_setup.sql`.
2. Zamijeni `PASTE_YOUR_AUTH_USER_UUID_HERE` svojim točnim **User UID**.
3. U Supabase **SQL Editor → New query** zalijepi SQL i pokreni **Run**.
4. Ta skripta uključuje RLS: svi mogu **čitati** katalog, ali samo taj vlasnički UID može pisati. Sigurno je ponovno pokrenuti skriptu bez dupliciranja politika.

## 3. Javne postavke weba

1. U Supabase dashboardu pronađi **Project URL** i **Publishable key** (ili stariji **anon** ključ) u **Project Settings → API Keys** / Connect.
2. Otvori `js/config.js`, unesi svoja dva podatka (primjer dolje), bez mijenjanja naziva polja.

```js
window.MIRISNI_CONFIG = {
  supabaseUrl: "https://TVOJ-PROJEKT.supabase.co",
  supabaseAnonKey: "TVOJ_PUBLISHABLE_ILI_ANON_KLJUC"
};
```

Publishable/anon ključ smije biti u javnom kodu jer sigurnost provode RLS pravila. **Nikad ne stavljaj secret/service_role ključ** u ovaj file.

## 4. Objavi i prvi put napuni bazu

1. Prenesi sve datoteke iz ZIP-a u postojeći GitHub Pages repozitorij, uključujući `js/config.js` i `supabase_setup.sql` (SQL možeš izostaviti nakon pokretanja, jer ga web ne koristi).
2. Otvori svoju stranicu i tvrdo osvježi (**Ctrl+Shift+R**).
3. Klikni **Prijava vlasnika**, unesi email i lozinku svog Supabase korisnika.
4. Ako je baza prazna, potvrdi **objavu početnog kataloga** – to prenosi postojeći katalog u Supabase i omogućuje svim posjetiteljima da vide kasnije promjene.
5. Promijeni testnu količinu i spremi. Otvori istu stranicu u anonimnom prozoru i provjeri da je nova vrijednost vidljiva, ali ne i gumbi za uređivanje.

## 5. Važne napomene

- Nakon prvog objavljivanja Supabase je izvor istine. Izmjene u `js/data.js` više ne mijenjaju automatski online katalog.
- Prije prvog prijenosa možeš preuzeti **Backup JSON** lokalnog kataloga. Ne zamjenjuj bazu starim backupom bez provjere.
- Pozadinska PWA predmemorija može zadržati stari izgled; u slučaju problema ponovno otvori/obnovi aplikaciju ili osvježi stranicu.
- Admin prijava koristi Supabase Auth; sama web-stranica i fotografije su javne. `noindex` nije zaštita privatnosti.
- Nikad ne dijeli lozinku, Auth session tokene ni secret ključ.
