--
-- Table: api_keys
--

CREATE TABLE IF NOT EXISTS public.api_keys (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    value character(64) NOT NULL,
    domain text NOT NULL,
    CONSTRAINT user_fkey
        FOREIGN KEY(user_id)
	        REFERENCES users(id)
);
