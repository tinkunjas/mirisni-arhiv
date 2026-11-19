MIRISNI ARHIV — DOPUNA 19.11.2026

ŠTO JE PROMIJENJENO
• Mancera Cedrat Boise, 15 ml, premješten u MOJE PARFEME (bočice).
• Bentley For Men Intense uklonjen iz aktivnog kataloga i arhive.
• Azzaro: Forever Wanted Elixir (zlatna bočica), 1 ml.
• Valentino: Born in Roma Extradose Uomo (ne Overdose); količina nije navedena.
• Dvanaest slika iz SLIKEE.zip povezano s točnim zapisima i pretvoreno u WebP.
• Dodani opisi, Fragrantica linkovi, note i ocjene gdje su se mogle provjeriti.
• U admin načinu dostupno je "Obriši" na kartici; dodatno "Trajno izbriši" unutar Uredi.
• Nisu upisane neprovjerene ocjene (Valentino Extradose, Al Haramain Amber Oud bez podverzije).

VAŽNO — REDOSLIJED
1. Na živoj stranici prijavi se i napravi JSON backup trenutne kolekcije.
2. Supabase > SQL Editor > New query > zalijepi SUPABASE_NOVI_MIRISI_20261119.sql > Run.
3. Zatim zamijeni datoteke u lokalnom GitHub folderu i pokreni:
   cd "C:\Users\tinku\Desktop\Perfumes_arhive"
   git add .
   git commit -m "Update new fragrances and images"
   git push origin main
4. Nakon objave osvježi stranicu i PWA; provjeri admin i anonimni pogled.

Ova SQL migracija je ponovljiva i ne prepisuje postojeće korisničke ocjene, cijene ili bilješke.
Na stranici administratorsko brisanje zahtijeva potvrdu i spremanje u Supabase.
