-- Enable read access for all users (including anonymous users) on the goods table
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."goods";
CREATE POLICY "Enable read access for all users" ON "public"."goods" FOR SELECT USING (true);
