--
-- Table: user_model
--

CREATE TABLE IF NOT EXISTS public.user_model (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    model_id integer,
    CONSTRAINT user_fkey
        FOREIGN KEY(user_id)
	        REFERENCES users(id),
    CONSTRAINT model_fkey
        FOREIGN KEY(model_id)
	        REFERENCES models(id)
);
