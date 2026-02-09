-- Create basic tables for the real estate application
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "username" character varying NOT NULL,
    "email" character varying,
    "password" character varying NOT NULL,
    "role" character varying NOT NULL DEFAULT 'user',
    "refreshTokenHash" character varying,
    "resetPasswordToken" character varying,
    "resetPasswordExpires" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);
-- Properties table
CREATE TABLE IF NOT EXISTS "properties" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "guid" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "code" character varying NOT NULL,
    "title" character varying NOT NULL,
    "description" text,
    "price" numeric(10,2),
    "salePrice" numeric(10,2),
    "address" text,
    "neighborhood" character varying,
    "city" character varying,
    "country" character varying,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "propertyType" character varying NOT NULL,
    "status" character varying NOT NULL DEFAULT 'active',
    "bedrooms" integer,
    "bathrooms" integer,
    "area" numeric(10,2),
    "landArea" numeric(10,2),
    "floor" integer,
    "totalFloors" integer,
    "orientation" character varying,
    "yearBuilt" integer,
    "heating" character varying,
    "parking" boolean DEFAULT false,
    "elevator" boolean DEFAULT false,
    "terrace" boolean DEFAULT false,
    "balcony" boolean DEFAULT false,
    "garden" boolean DEFAULT false,
    "garage" boolean DEFAULT false,
    "furnished" boolean DEFAULT false,
    "specialOffer" integer DEFAULT 0,
    "featured" boolean DEFAULT false,
    "comment" text,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_2ffb2e4a07d0b9b1c0c5c8e3e3a" PRIMARY KEY ("id")
);
-- Clients table
CREATE TABLE IF NOT EXISTS "clients" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "guid" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "ownerName" character varying,
    "ownerJmbg" character varying,
    "ownerIdCardNumber" character varying,
    "clientTransactionType" character varying,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "representativeId" uuid,
    CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id")
);
-- Property images table
CREATE TABLE IF NOT EXISTS "property_images" (
    "id" SERIAL NOT NULL,
    "filename" character varying NOT NULL,
    "originalName" character varying NOT NULL,
    "mimeType" character varying NOT NULL,
    "size" integer NOT NULL,
    "url" character varying NOT NULL,
    "order" integer NOT NULL DEFAULT 0,
    "isFavorite" boolean NOT NULL DEFAULT false,
    "propertyId" uuid,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_1c6d69c3e3b1c0c5c8e3e3a" PRIMARY KEY ("id")
);
-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "email" character varying NOT NULL,
    "name" character varying,
    "subscribed" boolean NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_1c6d69c3e3b1c0c5c8e3e3b" PRIMARY KEY ("id")
);
-- Representatives table
CREATE TABLE IF NOT EXISTS "representatives" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" character varying,
    "address" text,
    "phone" character varying,
    "jmbg" character varying(13),
    "birthplace" text,
    "idCardNumber" character varying(50),
    "idCardIssuePlace" text,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_representatives" PRIMARY KEY ("id")
);
-- Create indexes
CREATE INDEX IF NOT EXISTS "IDX_username_search_index" ON "users" ("username");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_username" ON "users" ("username");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email" ON "users" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_properties_code" ON "properties" ("code");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_properties_guid" ON "properties" ("guid");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_clients_guid" ON "clients" ("guid");
CREATE INDEX IF NOT EXISTS "IDX_properties_status" ON "properties" ("status");
CREATE INDEX IF NOT EXISTS "IDX_properties_type" ON "properties" ("propertyType");
CREATE INDEX IF NOT EXISTS "IDX_properties_price" ON "properties" ("price");
CREATE INDEX IF NOT EXISTS "IDX_newsletter_subscribers_email" ON "newsletter_subscribers" ("email");
-- Add foreign keys
ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_client" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "property_images" ADD CONSTRAINT "FK_property_images_property" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "clients" ADD CONSTRAINT "FK_clients_representative" FOREIGN KEY ("representativeId") REFERENCES "representatives"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
