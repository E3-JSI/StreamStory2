--
-- Table: datasources
--

CREATE TABLE IF NOT EXISTS public.datasources (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    name varchar(255) NOT NULL,
    description text NOT NULL DEFAULT '',
    url text NOT NULL,
    time_window_start timestamp,
    time_window_end timestamp,
    interval integer,
    CONSTRAINT user_fkey
        FOREIGN KEY(user_id)
	        REFERENCES users(id)
);

-- 
-- Table: models
-- 

DO $$ 
    BEGIN
        BEGIN
            ALTER TABLE public.models 
            ADD COLUMN datasource_id integer;
            ALTER TABLE public.models
            ADD CONSTRAINT datasource_fkey
            FOREIGN KEY(datasource_id)
                REFERENCES datasources(id);
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column datasource_id already exists in public.models.';
        END;
    END;
$$
