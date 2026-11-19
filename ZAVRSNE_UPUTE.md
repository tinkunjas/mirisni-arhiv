# Mirisni arhiv — završno poliranje (19. 11. 2026.)

## Novo
- Posjetitelji više ne vide admin CSV i kopiranje kompletnog internog popisa; Reset, Backup i uređivanje ostaju skriveni.
- Gumb **Kopiraj dostupne** izrađuje popis mirisa označenih za zamjenu/prodaju i njihove količine.
- U detaljnom prikazu **Kopiraj poveznicu** izrađuje direktnu poveznicu (`?parfem=ID#imam` ili `#testeri`).
- Slike su lokalno optimizirane gdje je optimizacija bila korisna; lošije fotografije nisu proizvoljno zamijenjene internetskim slikama.
- PWA koristi nov cache i mrežnu provjeru novih CSS/JS datoteka. I dalje je potreban internet za sinkronizaciju Supabase podataka.
- Ocjene 0–10 su privatne samo ako je pokrenuta SQL migracija iz prethodnog ZIP-a. Zbog sigurnosti obavezno provjeriti anonimni pristup API-ju.

## Objavljivanje
1. Na stranici pod admin računom napravi JSON backup prije bilo kakve izmjene.
2. Ako već nisi, u Supabase SQL Editoru izvrši `SUPABASE_MIGRACIJA_20261119.sql` iz ZIP-a.
3. Zamijeni datoteke u `C:\Users\tinku\Desktop\Perfumes_arhive` sadržajem ovog foldera (zadrži strukturu).
4. U PowerShellu: `git add .`, `git commit -m "Final polish"`, `git push origin main`.
5. Ponovno otvori stranicu, na mobitelu zatvori i ponovo pokreni PWA.
6. Test: odjavi se, otvori anonimni prozor i provjeri da su ocjene nevidljive, a dijeljenje i filtriranje rade.

## Napomena
Katalog u Supabaseu ima prednost nad lokalnim početnim podacima `js/data.js`. Ako dodaješ nove testere isključivo u `data.js`, neće se automatski dodati u postojeću online bazu. Dodaj ih kao administrator kroz stranicu.
