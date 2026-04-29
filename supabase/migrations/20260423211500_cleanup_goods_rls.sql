-- Drop the redundant policy that limited read access to authenticated users only
DROP POLICY IF EXISTS "Allow authenticated users to read goods" ON "public"."goods";
