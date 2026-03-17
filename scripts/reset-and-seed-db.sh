#!/bin/bash

# Complete Database Reset and Setup Script
# This will drop everything, recreate schema, and seed data

set -e

echo "========================================="
echo "Complete Database Setup"
echo "========================================="

# Step 1: Drop and recreate the database
echo ""
echo "Step 1: Resetting database..."
docker exec estates_postgres psql -U postgres -d estates -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
"

echo "✓ Database reset complete"

# Step 2: Create UUID extension
echo ""
echo "Step 2: Creating UUID extension..."
docker exec estates_postgres psql -U postgres -d estates -c "
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
"

echo "✓ UUID extension created"

# Step 3: Create all tables
echo ""
echo "Step 3: Creating tables..."

docker exec estates_postgres psql -U postgres -d estates <<'EOF'
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

-- Create properties table with ALL columns
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guid UUID UNIQUE DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    "propertyType" VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    price DECIMAL(10,2),
    "salePrice" DECIMAL(10,2),
    area FLOAT,
    address TEXT,
    neighborhood VARCHAR(255),
    lat FLOAT,
    lon FLOAT,
    comment TEXT,
    elevator BOOLEAN,
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
    "updatedAt" TIMESTAMP DEFAULT NOW()
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
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create property_images table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "imageUrl" VARCHAR(500) NOT NULL,
    "order" INTEGER DEFAULT 0,
    "isFavorite" BOOLEAN DEFAULT false,
    "propertyId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
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
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create migrations table
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- Add foreign keys
ALTER TABLE clients ADD CONSTRAINT "FK_clients_property"
    FOREIGN KEY ("propertyId") REFERENCES properties(id) ON DELETE SET NULL;

ALTER TABLE clients ADD CONSTRAINT "FK_clients_representative"
    FOREIGN KEY ("representativeId") REFERENCES representatives(id) ON DELETE SET NULL;

ALTER TABLE representatives ADD CONSTRAINT "FK_representatives_client"
    FOREIGN KEY ("clientId") REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE property_images ADD CONSTRAINT "FK_property_images_property"
    FOREIGN KEY ("propertyId") REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE agent_messages ADD CONSTRAINT "FK_agent_messages_conversation"
    FOREIGN KEY ("conversationId") REFERENCES agent_conversations(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties("propertyType");
CREATE INDEX idx_properties_guid ON properties(guid);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_transaction ON clients("transactionType");
CREATE INDEX idx_agent_conversations_status ON agent_conversations(status);
CREATE INDEX idx_agent_messages_conversation ON agent_messages("conversationId");
EOF

echo "✓ Tables created"

# Step 4: Verify tables
echo ""
echo "Step 4: Verifying tables..."
TABLE_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
echo "Tables created: $TABLE_COUNT"

# Step 5: Seed database
echo ""
echo "Step 5: Seeding database..."
cd /home/dalibor/Projects/RealEstatesAPI-NestJS/apps/api
npx ts-node ../../seeds/local-comprehensive-seed.ts

# Step 6: Verify data
echo ""
echo "Step 6: Verifying data..."
USER_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM users;")
PROPERTY_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM properties;")
CLIENT_COUNT=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM clients;")

echo "Users: $USER_COUNT"
echo "Properties: $PROPERTY_COUNT"
echo "Clients: $CLIENT_COUNT"

echo ""
echo "========================================="
echo "✓ Database setup complete!"
echo "========================================="
echo ""
echo "You can now start the API:"
echo "  cd apps/api"
echo "  npm run start:dev"
