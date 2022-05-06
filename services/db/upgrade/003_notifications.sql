--
-- Table: notifications
--

CREATE TABLE IF NOT EXISTS public.notifications (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    model_id integer,
    type varchar(64),
    title text NOT NULL,
    content text NOT NULL,
    time timestamp DEFAULT now() NOT NULL,
    read boolean DEFAULT false NOT NULL,
    CONSTRAINT user_fkey
        FOREIGN KEY(user_id)
	        REFERENCES users(id),
    CONSTRAINT model_fkey
        FOREIGN KEY(model_id)
	        REFERENCES models(id)
);
