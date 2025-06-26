CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name text
);

INSERT INTO users (name) VALUES
    ('John Lennon'),
    ('Paul McCartney'), 
    ('George Harrison'),
    ('Ringo Starr'),
    ('George Martin');
