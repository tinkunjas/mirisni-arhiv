# Mirisni arhiv — ispravak 19. 11. 2026.

1. Prijavi se kao vlasnik na postojeći Mirisni arhiv i preuzmi JSON backup.
2. Supabase → SQL Editor → New query: zalijepi cijeli `SUPABASE_TESTERI_20261119.sql` i klikni Run. Ova migracija mijenja samo testere, ne dira bočice, privatne ocjene ili cijene.
3. Raspakiraj ZIP u `C:\Users\tinku\Desktop\Perfumes_arhive` (sadržaj na vrh foldera).
4. PowerShell: `git add .`; `git commit -m "Fix tester catalog and layout"`; `git push origin main`.
5. Na stranici Ctrl+Shift+R, a na instaliranoj PWA zatvori/otvori aplikaciju. Provjeri novih 12 zapisa i pet uklonjenih.

Promjene: naslov taba samo Mirisni arhiv; nema ograničenja od 18 kartica; uklonjeni početni statistički blok i filter skupina; sačuvani su pretraga, sortiranje, prijava, detalji, WhatsApp popis i PWA.

Novi testeri bez potvrđene količine: Roja Sweetie Aoud i Valentino Overdose. Naziv "Pacific Aura" i točan Valentino/Azzaro proizvod vrijedi naknadno potvrditi. Slike za nove testere nisu dodane (ne koristi krive fotografije).

VAŽNO: SQL mora biti pokrenut, jer stranica učitava katalog iz Supabasea, ne samo iz data.js. Sam upload GitHub ZIP-a ne mijenja postojeću online evidenciju.
