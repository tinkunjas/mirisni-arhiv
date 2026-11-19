begin;

do $migration$
declare
  current_doc jsonb;
  entry jsonb;
  bucket text;
  target_id text;
  existing_row jsonb;
  merged_row jsonb;
  list_rows jsonb;
  updated_rows jsonb;
  deleted jsonb;
begin
  select data into current_doc from public.catalog_state where id = 1 for update;
  if current_doc is null then
    raise exception 'Katalog nije pronađen u Supabaseu. Prvo inicijaliziraj postojeći katalog kroz administratorsku prijavu.';
  end if;
  deleted := coalesce(current_doc -> 'deletedIds', '[]'::jsonb);
  current_doc := jsonb_set(current_doc, '{bottles}', coalesce((
    select jsonb_agg(e.value order by e.ordinality)
    from jsonb_array_elements(coalesce(current_doc -> 'bottles','[]'::jsonb)) with ordinality as e(value, ordinality)
    where e.value ->> 'id' not in ('b031','t070')
  ), '[]'::jsonb));
  current_doc := jsonb_set(current_doc, '{testers}', coalesce((
    select jsonb_agg(e.value order by e.ordinality)
    from jsonb_array_elements(coalesce(current_doc -> 'testers','[]'::jsonb)) with ordinality as e(value, ordinality)
    where e.value ->> 'id' <> 't070'
  ), '[]'::jsonb));
  for entry in select value from jsonb_array_elements($records$[{"heartNotes":["Cimet","Mahagonij","Karanfil"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Hugo-Boss/Boss-Bottled-383.html","id":"b047","name":"Boss Bottled EDT","baseNotes":["Vanilija","Sandalovina","Cedar","Vetiver","Maslina"],"family":"Začinski","category":"Designer","description":"Klasični voćno-začinski miris s jabukom, cimetom, vanilijom i drvenastom bazom.","brand":"Hugo Boss","ml":30,"frRating":4.08,"kind":"bottle","topNotes":["Jabuka","Šljiva","Bergamot","Limun","Hrastova mahovina","Geranij"],"notesVerified":true,"image":"assets/bottles/b047.webp","section":"bottles","ownership":"owned","status":"U kolekciji"},{"heartNotes":["Bosiljak","Mrkva","Ruža"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Rayhaan/Pacific-Aura-109709.html","id":"t071","name":"Pacific Aura","baseNotes":["Smokva","Ambroxan","Amber"],"family":"Citrusni","category":"Tester","description":"Živahni citrusi, metvica i crni ribiz uz aromatično bilje te toplu ambroksansku bazu.","brand":"Rayhaan","ml":5,"frRating":4.28,"kind":"tester","topNotes":["Mandarina","Metvica","Citron","Bergamot","Crni ribiz","Korijander"],"notesVerified":true,"image":"assets/new-testers/t071.webp","section":"testers"},{"heartNotes":["Đumbir","Biljne note","Puderaste note"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Sospiro-Perfumes/Vibrato-75930.html","id":"t072","name":"Vibrato","baseNotes":["Mošus","Cedar","Amber","Pačuli","Korijen irisa"],"family":"Citrusni","category":"Tester","description":"Sjajni grejp i bergamot s jasminom i magnolijom; u srcu đumbir, u bazi čisti mošus i cedar.","brand":"Sospiro","ml":5,"frRating":4.53,"kind":"tester","topNotes":["Grejp","Bergamot","Jasmin","Magnolija"],"notesVerified":true,"image":"assets/new-testers/t072.webp","section":"testers"},{"heartNotes":["Labdanum","Lavanda","Oud"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Argos/Fall-of-Phaeton-96868.html","id":"t073","name":"Fall of Phaeton","baseNotes":["Koža","Tonka","Vanilija","Mošus"],"family":"Začinski","category":"Tester","description":"Začinski citrusni početak s đumbirom i kardamomom, smolastim srcem te kožom i tonkom u bazi.","brand":"Argos","ml":4,"frRating":4.37,"kind":"tester","topNotes":["Đumbir","Kardamom","Bergamot","Limun","Ružičasti papar"],"notesVerified":true,"image":"assets/new-testers/t073.webp","section":"testers"},{"heartNotes":[],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/search/?query=Al%20Haramain%20Amber%20Oud","id":"t074","name":"Amber Oud","baseNotes":[],"family":"Drvenasti","category":"Tester","description":"Topli amberno-drvenasti miris iz linije Amber Oud; točnu podverziju potrebno je potvrditi za preciznu piramidu.","brand":"Al Haramain","ml":2,"frRating":null,"kind":"tester","topNotes":[],"notesVerified":false,"image":"assets/new-testers/t074.webp","section":"testers"},{"heartNotes":[],"count":1,"capacity":null,"flatNotes":["Rum","Duhan","Cimet","Šafran","Sandalovina","Hedione"],"frUrl":"https://www.fragrantica.com/perfume/Initio-Parfums-Prives/Side-Effect-42260.html","id":"t075","name":"Side Effect","baseNotes":[],"family":"Začinski","category":"Tester","description":"Bogat i intenzivan začinsko-alkoholni miris s rumom, duhanom, cimetom i sandalovinom.","brand":"Initio","ml":2,"frRating":4.32,"kind":"tester","topNotes":[],"notesVerified":true,"image":"assets/new-testers/t075.webp","section":"testers"},{"heartNotes":["Coca-Cola","List pačulija","Cvijet naranče"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Mancera/Tonka-Cola-76893.html","id":"t076","name":"Tonka Cola","baseNotes":["Tonka","Vanilija","Benzoin","Labdanum"],"family":"Gourmand","category":"Tester","description":"Trešnja, cimet i limun spajaju se s prepoznatljivom cola notom, tonkom i vanilijom.","brand":"Mancera","ml":4,"frRating":4.03,"kind":"tester","topNotes":["Cimet","Trešnja","Sicilijanski limun","Muškatni oraščić"],"notesVerified":true,"image":"assets/new-testers/t076.webp","section":"testers"},{"heartNotes":[],"count":1,"capacity":null,"flatNotes":["Drvenaste note","Cedar","Sol","Morska voda","Zelene note"],"frUrl":"https://www.fragrantica.com/perfume/Xerjoff/40-Knots-16445.html","id":"t077","name":"40 Knots","baseNotes":[],"family":"Morski","category":"Tester","description":"Morska sol, zelene note, voda i cedar u elegantnom slankasto-drvenastom mirisu.","brand":"Xerjoff","ml":4,"frRating":4.25,"kind":"tester","topNotes":[],"notesVerified":true,"image":"assets/new-testers/t077.webp","section":"testers"},{"heartNotes":["Cimet","Ylang-ylang","Indijski jasmin","Bugarska ruža"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Xerjoff/Ouverture-55164.html","id":"t078","name":"Ouverture","baseNotes":["Sandalovina","Amber","Vanilija","Kašmirsko drvo","Tamjan"],"family":"Cvjetni","category":"Tester","description":"List smokve, naranča i magnolija otvaraju topao cvjetno-začinski miris sa sandalovinom.","brand":"Xerjoff","ml":4,"frRating":4.16,"kind":"tester","topNotes":["List smokve","Naranča","Magnolija"],"notesVerified":true,"image":"assets/new-testers/t078.webp","section":"testers"},{"heartNotes":[],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Roja-Dove/Sweetie-Aoud-31493.html","id":"t079","name":"Sweetie Aoud","baseNotes":[],"family":"Gourmand","category":"Tester","description":"Bogata slatko-drvenasta kompozicija s gurmanskim dojmom slastičarnice, oudom i tamjanom.","brand":"Roja Dove","ml":null,"frRating":4.29,"kind":"tester","topNotes":[],"notesVerified":true,"image":"assets/new-testers/t079.webp","section":"testers"},{"heartNotes":["Divlja lavanda"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Valentino/Born-in-Roma-Extradose-Uomo-101383.html","id":"t080","name":"Born in Roma Extradose Uomo","baseNotes":["Drvenaste note"],"family":"Začinski","category":"Tester","description":"Intenzivna začinska otvaranja, divlja lavanda i tople drvenaste note.","brand":"Valentino","ml":null,"frRating":null,"kind":"tester","topNotes":["Začinske note"],"notesVerified":true,"image":"assets/new-testers/t080.webp","section":"testers"},{"heartNotes":["Kardamom","Lavanda","Muškatna kadulja"],"count":1,"capacity":null,"frUrl":"https://www.fragrantica.com/perfume/Azzaro/Forever-Wanted-Elixir-102882.html","id":"t081","name":"Forever Wanted Elixir","baseNotes":["Koža","Wolfwood","Vetiver"],"family":"Voćni","category":"Tester","description":"Malina i zelena mandarina uz kardamom i lavandu, s toplom kožnato-drvenastom bazom.","brand":"Azzaro","ml":1,"frRating":4.22,"kind":"tester","topNotes":["Malina","Zelena mandarina","Bergamot"],"notesVerified":true,"image":"assets/new-testers/t081.webp","section":"testers"}]$records$::jsonb) loop
    bucket := entry ->> 'section';
    target_id := entry ->> 'id';
    entry := entry - 'section';
    if deleted ? target_id and target_id <> 'b047' then
      continue;
    end if;
    list_rows := coalesce(current_doc -> bucket,'[]'::jsonb);
    select e.value into existing_row from jsonb_array_elements(list_rows) as e(value) where e.value ->> 'id' = target_id limit 1;
    if existing_row is null then
      list_rows := list_rows || jsonb_build_array(entry);
    else
      merged_row := existing_row || entry;
      select jsonb_agg(case when e.value ->> 'id' = target_id then merged_row else e.value end order by e.ordinality)
      into updated_rows from jsonb_array_elements(list_rows) with ordinality as e(value, ordinality);
      list_rows := updated_rows;
    end if;
    current_doc := jsonb_set(current_doc, array[bucket], list_rows);
    existing_row := null;
  end loop;
  current_doc := jsonb_set(current_doc,'{deletedIds}',(select coalesce(jsonb_agg(distinct v), '[]'::jsonb) from jsonb_array_elements_text(deleted || '["b031","t070"]'::jsonb) as t(v)));
  update public.catalog_state set data = current_doc, updated_at = now() where id = 1;
end
$migration$;

commit;
