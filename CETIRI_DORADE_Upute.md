# Mirisni arhiv — četiri dorade (19.11.2026.)

## Uključeno

1. **Samo dvije vidljive oznake:** Za prodaju / Za zamjenu; nedostupni nemaju oznaku. U administratorskom uređivanju izbor je: U kolekciji / Za zamjenu / Za prodaju.
2. **Privatne osobne ocjene:** javni katalog vraća podatke kroz `public_perfume_catalog()` bez `personalRating`. Izravno čitanje `catalog_state` dopušteno je samo vlasniku putem RLS-a. Fragrantica ocjena ostaje javna.
3. **Različit prikaz količina:** za bočice preostalo/ukupno (kad je kapacitet poznat), za testere samo količina u ml.
4. **Pretraga po notama:** uključuje sve tri razine piramide i ravni popis nota; radi i kada se upišu slova bez hrvatskih dijakritika.

**Automatska zamjena:** za aktivne bočice s osobnom ocjenom <= 7 status je Za zamjenu; **ručna Za prodaju ima prednost**. Prebacivanje na ocjenu veću od 7 uklanja samo automatski postavljenu oznaku.

## Redoslijed objave

1. Napravi vlasnički JSON backup iz postojeće stranice prije zamjene.
2. U Supabase **SQL Editoru** pokreni `SUPABASE_MIGRACIJA_20261119.sql` (može se pokrenuti i nakon ranije migracije).
3. Kopiraj sadržaj ovog ZIP-a preko lokalnog projekta `C:\Users\tinku\Desktop\Perfumes_arhive`.
4. U tom folderu izvrši `git add .`, `git commit -m "Four catalog improvements"`, `git push origin main`.
5. U anonimnom prozoru provjeri dvije oznake, pretragu po notama i nepostojanje osobnih ocjena. U vlasničkom prozoru provjeri status/prodaja pri osobnoj ocjeni <= 7.

Nove datoteke namjerno ne mijenjaju podatke tvoje postojeće online kolekcije pri samoj objavi; za postojeća polja statusa služi SQL migracija.
