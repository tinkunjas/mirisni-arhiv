begin;
update public.catalog_state
set data = jsonb_set(data, '{testers}', (
 select coalesce(jsonb_agg(
  case
   when item->>'id' = 't079' then item || '{"description":"Bogati gourmand s dojmom toplog peciva i slastičarnice, ružom, smolama i izraženim oudom.","ml":1,"frRating":4.29,"frUrl":"https://www.fragrantica.com/perfume/Roja-Dove/Sweetie-Aoud-31493.html","topNotes":["Pelin","Bergamot"],"heartNotes":["Gourmand akord","Svibanjska ruža","Bušin"],"baseNotes":["Oud","Kardamom","Tamjan","Gurjun balzam","Amyris","Labdanum","Gvajakovo drvo","Pačuli","Borovica","Nagarmotha","Cedar","Kumin"],"notesVerified":true}'::jsonb
   when item->>'id' = 't080' then item || '{"description":"Intenzivna aromatično-začinska verzija Born in Roma: začinski početak, divlja lavanda i duboka drvenasta baza.","ml":1,"frRating":4.39,"frUrl":"https://www.fragrantica.com/perfume/Valentino/Born-in-Roma-Extradose-Uomo-101383.html","topNotes":["Začinske note"],"heartNotes":["Divlja lavanda"],"baseNotes":["Drvenaste note"],"notesVerified":true}'::jsonb
   else item end
  order by ord), '[]'::jsonb)
 from jsonb_array_elements(coalesce(data->'testers','[]'::jsonb)) with ordinality as e(item,ord)
)), updated_at = now()
where id = 1;
commit;
