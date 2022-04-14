-- 
-- Table: models
-- 

DO $$ 
    BEGIN
        BEGIN
            ALTER TABLE public.models 
            ADD COLUMN state json;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column state already exists in public.models.';
        END;
    END;
$$
