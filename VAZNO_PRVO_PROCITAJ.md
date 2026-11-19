# Mirisni arhiv – privatne ocjene, zamjena i brži prikaz

## 1. Prvo napravi sigurnosnu migraciju u Supabase SQL Editoru

U već postojećem projektu otvori **SQL Editor → New query**. Zalijepi cijelu datoteku `SUPABASE_MIGRACIJA_20261119.sql` i klikni **Run**.

Migracija koristi već postojeću funkciju `public.is_catalog_owner()` iz prethodnog postavljanja. Ne treba unositi ni mijenjati UID ili ključ. Radi nad postojećim katalogom; čuva ocjene u bazi, ali ih više ne daje anonimnim posjetiteljima. Pristup sirovom `catalog_state` dopušta samo vlasniku, a javna funkcija vraća katalog bez `personalRating`. Za aktivne bočice s ocjenom do 7 mijenja status u `Za zamjenu`; za ostale objavljuje samo `Za prodaju`, `Za zamjenu` ili neutralni status.

**Ne objavljuj novu verziju stranice prije uspješnog pokretanja SQL-a**, jer novi frontend očekuje novu javnu funkciju. Napravi Supabase backup prije migracije ako imaš naknadne ručne unose.

## 2. Objavi datoteke na GitHub Pages

Raspakiraj ZIP. Kopiraj *sadržaj* ZIP-a u `C:\Users\tinku\Desktop\Perfumes_arhive` uz zamjenu postojećih datoteka.

U PowerShellu u tom folderu:

```powershell
git add .
git commit -m "Private ratings and faster catalog"
git push origin main
```

Otvori https://tinkunjas.github.io/mirisni-arhiv/ i osvježi `Ctrl + Shift + R`. Ako je PWA instaliran, potpuno ga zatvori pa ponovno pokreni radi ažuriranja.

## 3. Testiraj

1. U anonimnom pregledniku otvori stranicu: ne smiješ vidjeti svoju ocjenu ni u karticama, ni u detaljima, ni u javnom odgovoru `public_perfume_catalog`.
2. Prijavi se kao vlasnik i provjeri svoje ocjene. Ostaju u bazi i pojavljuju se samo administratoru.
3. Promijeni osobnu ocjenu neke **bočice** na 7 ili manje i spremi. Oznaka mora postati `Za zamjenu`, a parfem se mora pojaviti u dostupnima. Ocjenama testera ne mijenja se dostupnost bočica.
4. Klikni `Za prodaju`, `Za zamjenu` ili neutralnu opciju u uređivanju. Ako je aktivna bočica i ocjena joj je <= 7, `Za zamjenu` ima prednost.
5. Učitavanje prikazuje 18 mirisa po grupi, zatim `Prikaži još`. Pretraga ne renderira sve kartice za svaki pritisak tipke.

## Napomena o privatnosti

Prethodna verzija baze je ocjene davala anonimnim posjetiteljima. Ova migracija zatvara taj pristup za **buduće upite**, ali ne može poništiti kopije ili predmemorije koje su nastale prije migracije. Ocjene se još mogu vidjeti nekome tko je ranije spremio staru javnu verziju stranice ili podatke. Ne dijeli backup JSON (u njemu su tvoje privatne ocjene).

Sama Fragrantica ocjena ostaje javna. Ni prijava ni Supabase URL/javni publishable key nisu tajna, a pristup štiti RLS.
