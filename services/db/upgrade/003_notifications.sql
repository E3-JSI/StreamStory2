--
-- Table: notifications
--

CREATE TABLE IF NOT EXISTS public.notifications (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    CONSTRAINT user_fkey
        FOREIGN KEY(user_id)
	        REFERENCES users(id)
);
