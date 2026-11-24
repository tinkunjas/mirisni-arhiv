# Mirisni arhiv — V2 + dopuna Fragrantice, 21.11.2026.

## Novo u V2

- Donja navigacija na mobitelu ostaje dostupna tijekom listanja.
- Kartice / Popis: izbor se pamti u tom pregledniku i ne mijenja katalog.
- Filtri mirisnih skupina s brojem mirisa; brojevi se odnose na cijelu odabranu kategoriju. Pretraga, skupina i prodaja/zamjena mogu se kombinirati.
- Izbor do tri upisane note na kartici i oznaka preostalih nota dostupnih u detaljima. Redoslijed je preuzet iz podataka i ne označava jačinu ili dominaciju note.
- Pokazatelj preostalih ml u odnosu na poznati kapacitet bočice; ne prikazuje se kada podaci nisu potpuni ili valjani. U mobilnom popisu količina ostaje tekstualna, a pokazatelj se vidi u detaljima.
- Fotografija otvara detalje parfema. Jasniji vizualni prikaz grupa nota.

## Što je promijenjeno

- Jedinstven tamnozeleni dizajn s većom tipografijom, preglednijim karticama, cjenikom i detaljima.
- Responzivna navigacija s brojem mirisa i prilagodba za mobitel.
- Tri preklapajuće CSS datoteke zamijenjene su datotekom css/catalog.css.
- Događaji kartica obrađuju se na jednom mjestu, bez ponovnog dodavanja stotina listenera nakon pretrage.
- Normalizirani tekst pretrage privremeno se pamti i osvježava nakon izmjene podataka.
- Prelazak u drugu kategoriju otkazuje prethodnu pretragu koja još čeka izvršavanje.
- Dijalozi podržavaju upravljanje tipkovnicom, zadržavanje fokusa i povratak na prethodni element.
- Osvježen service worker i ispravljen offline dohvat verzioniranih JS/CSS datoteka.

## Postavljanje na postojeći GitHub Pages

Raspakiraj ZIP. Sadržaj ZIP-a ide u isti direktorij u kojem je sada index.html.

Zamijeni index.html, js/app.js i service-worker.js. Dodaj css/catalog.css, js/ui.js, js/presentation.js i js/fragrantica-enrichment.js. Zamijeni i js/data.js dopunjenom verzijom. Ostali podaci, fotografije, konfiguracija i SQL ostaju iz priložene originalne verzije. Stare css/base.css, css/theme.css i css/atelier.css više nisu potrebne jer ih novi index.html ne koristi.

Za ovu dizajnersku nadogradnju ne treba pokretati SQL, resetirati kolekciju ili ponovno uvoziti podatke. Supabase konfiguracija nije promijenjena. Ne zamjenjuj je ako si je u međuvremenu sam ažurirao.

Nakon objave osvježi stranicu. Ako otvorena stara kartica prikazuje prijašnji izgled, zatvori je i ponovno otvori ili napravi prisilno osvježavanje (Ctrl+Shift+R).

## Lokalni pregled

U raspakiranoj mapi pokreni `python -m http.server 8000` pa otvori `http://localhost:8000`. Lokalni pregled učitava postojeću Supabase konfiguraciju kada su mreža i CDN dostupni; prijavljen admin zato radi sa stvarnom bazom.

## Provjereno

- Sintaksa JavaScript datoteka.
- Sačuvano svih 139 unosa i svi osobni podaci; dopunjena su prazna javna polja u 22 unosa. Supabase konfiguracija nije promijenjena.
- Jednakost izlaza pravila ponuda, automatske zamjene, formatiranja, spajanja podataka i četiri kategorije sa starom verzijom.
- Pretraga po notama, prazni rezultati, povratak na sve mirise, sortiranje, filter prodaje/zamjene, navigacija i detalji u pregledniku.
- Mobilni prikaz na širinama 320 i 390 px bez horizontalnog prelijevanja.
- Kombiniranje filtra skupine s pretragom, poništavanje filtara, otvaranje detalja preko fotografije, izbor i pamćenje prikaza te mobilna navigacija.
- Valjanost prikaza količina, prazne bočice, izostavljanje nepoznatih kapaciteta i testera, uklanjanje duplih nota i siguran prikaz teksta.

Prijava vlasnika, pisanje u stvarnu bazu i rad bez mreže nisu end-to-end testirani. Nisu izvršene promjene u Supabase podacima niti objava na postojećoj GitHub stranici.

## Dopuna Fragrantice

Pogledaj DOPUNA_FRAGRANTICA.md za izvore i tri neriješena unosa. PROVJERA_PODATAKA.csv sadrži pregled svih 139 zapisa. Dopuna ne ažurira sve stare ocjene niti dodaje podatke koji nisu potvrđeni. Nove note i skupine provjerene su i u prikazu starijih online podataka.
