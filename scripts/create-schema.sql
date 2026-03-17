-- Complete Database Schema Creation Script
-- Run this to create all tables manually

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS agent_messages CASCADE;
DROP TABLE IF EXISTS agent_conversations CASCADE;
DROP TABLE IF EXISTS representatives CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordExpires" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guid UUID UNIQUE DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    "propertyType" VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    price DECIMAL(10,2),
    "salePrice" DECIMAL(10,2),
    area DECIMAL(10,2),
    address TEXT,
    neighborhood VARCHAR(255),
    lat DECIMAL(10,8),
    lon DECIMAL(11,8),
    comment TEXT,
    elevator BOOLEAN DEFAULT false,
    "additionalEquipment" JSONB,
    "constructionYear" INTEGER,
    bathrooms INTEGER,
    floor INTEGER,
    "roomStructure" VARCHAR(50),
    heating VARCHAR(50),
    "contractNumber" VARCHAR(100),
    "cadastralParcel" VARCHAR(100),
    "cadastralMunicipality" VARCHAR(100),
    orientation VARCHAR(50),
    "youtubeUrl" VARCHAR(500),
    "specialOffer" INTEGER,
    rooms INTEGER,
    "floorCount" INTEGER,
    furnished BOOLEAN,
    parking BOOLEAN,
    terrace BOOLEAN,
    basement BOOLEAN,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    "transactionType" VARCHAR(50),
    "paymentType" VARCHAR(50),
    comment TEXT,
    "moneyAmount" DECIMAL(10,2),
    "propertyId" UUID,
    "representativeId" UUID,
    "ownerName" VARCHAR(255),
    "ownerJmbg" VARCHAR(13),
    "ownerIdCardNumber" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("propertyId") REFERENCES properties(id) ON DELETE SET NULL
);

-- Create representatives table
CREATE TABLE representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    address TEXT,
    phone TEXT,
    jmbg VARCHAR(13),
    birthplace TEXT,
    "idCardNumber" VARCHAR(50),
    "idCardIssuePlace" TEXT,
    "clientId" UUID,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("clientId") REFERENCES clients(id) ON DELETE CASCADE
);

-- Add representative foreign key to clients (after representatives table exists)
ALTER TABLE clients ADD CONSTRAINT "FK_clients_representative"
    FOREIGN KEY ("representativeId") REFERENCES representatives(id) ON DELETE SET NULL;

-- Create property_images table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "imageUrl" VARCHAR(500) NOT NULL,
    "order" INTEGER DEFAULT 0,
    "isFavorite" BOOLEAN DEFAULT false,
    "propertyId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("propertyId") REFERENCES properties(id) ON DELETE CASCADE
);

-- Create newsletter_subscribers table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "unsubscribeToken" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create agent_conversations table
CREATE TABLE agent_conversations (
    id SERIAL PRIMARY KEY,
    "guestName" VARCHAR(255),
    "guestEmail" VARCHAR(255),
    "guestPhone" VARCHAR(50),
    "initialMessage" TEXT,
    "userId" INTEGER,
    "agentId" INTEGER,
    status VARCHAR(50) DEFAULT 'waiting',
    "unreadCount" INTEGER DEFAULT 0,
    locale VARCHAR(10) DEFAULT 'sr',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create agent_messages table
CREATE TABLE agent_messages (
    id SERIAL PRIMARY KEY,
    "conversationId" INTEGER NOT NULL,
    "senderId" INTEGER,
    "senderType" VARCHAR(50) DEFAULT 'guest',
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("conversationId") REFERENCES agent_conversations(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties("propertyType");
CREATE INDEX idx_properties_guid ON properties(guid);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_transaction ON clients("transactionType");
CREATE INDEX idx_agent_conversations_status ON agent_conversations(status);
CREATE INDEX idx_agent_conversations_agent ON agent_conversations("agentId");
CREATE INDEX idx_agent_messages_conversation ON agent_messages("conversationId");

-- Create migrations table for TypeORM
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL
);

COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON TABLE properties IS 'Real estate properties';
COMMENT ON TABLE clients IS 'Clients (buyers/sellers)';
COMMENT ON TABLE property_images IS 'Property images with ordering';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter email subscribers';
COMMENT ON TABLE agent_conversations IS 'Live chat conversations';
COMMENT ON TABLE agent_messages IS 'Live chat messages';
