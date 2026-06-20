-- This file intentionally only ensures the database exists.
--
-- Sample data (books, members, admin user) is seeded by DataSeeder.java
-- *after* Spring Boot starts and Hibernate creates the schema (ddl-auto=update).
-- A previous version of this file tried to INSERT INTO books/members directly,
-- but those tables do not exist yet at MySQL init time (they are created later
-- by Hibernate), so that script failed on every first-time container start.
CREATE DATABASE IF NOT EXISTS library_db;
