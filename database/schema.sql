-- Database Schema for Star-Gazer Analysis

-- Current Tables (one per business)
CREATE TABLE "L'Envol Art Space" (
    stars integer,
    name text,
    text text,
    textTranslated text,
    publishedAtDate timestamp,
    reviewUrl text,
    responseFromOwnerText text,
    sentiment text,
    staffMentioned text,
    mainThemes text
);

-- Same structure for other businesses:
CREATE TABLE "The Little Prince Cafe" (
    stars integer,
    name text,
    text text,
    textTranslated text,
    publishedAtDate timestamp,
    reviewUrl text,
    responseFromOwnerText text,
    sentiment text,
    staffMentioned text,
    mainThemes text
);

CREATE TABLE "Vol de Nuit, The Hidden Bar" (
    stars integer,
    name text,
    text text,
    textTranslated text,
    publishedAtDate timestamp,
    reviewUrl text,
    responseFromOwnerText text,
    sentiment text,
    staffMentioned text,
    mainThemes text
);

-- Planned: saved_recommendations table
CREATE TABLE saved_recommendations (
    id uuid PRIMARY KEY,
    business_name text,
    business_type text,
    recommendations jsonb,
    created_at timestamp
);
