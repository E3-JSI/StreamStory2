-- 
-- Table: models
-- 

DO $$ 
    BEGIN
        BEGIN
            ALTER TABLE public.models 
            ADD COLUMN uuid UUID DEFAULT (gen_random_uuid());
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column uuid already exists in public.models.';
        END;
    END;
$$
