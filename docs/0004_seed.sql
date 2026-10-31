-- 0004_seed.sql : minimal reference data. Run after 0001 to 0003. Safe to re-run is NOT guaranteed.
insert into payment_terms(name, days) values ('Immediate', 0), ('Net 15', 15), ('Net 30', 30);
insert into taxes(name, rate) values ('GST 18%', 18), ('GST 12%', 12), ('No tax', 0);

-- After creating the first account through the signup page, promote it to admin once:
-- update profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL');
