import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create property type enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "property_propertytype_enum" AS ENUM (
          'Apartment', 'House', 'Commercial', 'Garage'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR NOT NULL UNIQUE,
        "email" VARCHAR UNIQUE,
        "password" VARCHAR NOT NULL,
        "role" VARCHAR DEFAULT 'user',
        "refreshTokenHash" VARCHAR,
        "lastLogoutTime" TIMESTAMP,
        "resetPasswordToken" VARCHAR,
        "resetPasswordExpires" TIMESTAMP
      )
    `);

    // Create index for username (if not exists)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "username_search_index" ON "users" ("username")
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "status" VARCHAR DEFAULT 'Active',
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "email" TEXT UNIQUE,
        "phone" TEXT NOT NULL,
        "transactionType" VARCHAR DEFAULT 'Seller',
        "paymentType" VARCHAR DEFAULT 'Cash',
        "comment" TEXT,
        "moneyAmount" DECIMAL(10,0),
        "propertyId" uuid,
        "ownerJmbg" VARCHAR(13),
        "ownerBirthplace" TEXT,
        "ownerIdCardNumber" VARCHAR(50),
        "ownerIdCardIssuePlace" TEXT,
        "representativeId" uuid
      )
    `);

    // Create representatives table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "representatives" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" TEXT NOT NULL,
        "address" TEXT,
        "phone" TEXT,
        "jmbg" VARCHAR(13),
        "birthplace" TEXT,
        "idCardNumber" VARCHAR(50),
        "idCardIssuePlace" TEXT,
        "email" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "clientId" uuid,
        CONSTRAINT "FK_representative_client" FOREIGN KEY ("clientId") 
          REFERENCES "clients"("id") ON DELETE CASCADE
      )
    `);

    // Create properties table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "properties" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" VARCHAR NOT NULL UNIQUE,
        "description" TEXT,
        "propertyType" "property_propertytype_enum" DEFAULT 'Apartment',
        "status" VARCHAR DEFAULT 'Active',
        "price" DECIMAL(10,0) NOT NULL,
        "salePrice" DECIMAL(10,0) NOT NULL,
        "area" FLOAT,
        "address" VARCHAR NOT NULL,
        "neighborhood" VARCHAR(255),
        "lat" FLOAT,
        "lon" FLOAT,
        "comment" TEXT,
        "elevator" BOOLEAN,
        "additionalEquipment" JSONB,
        "constructionYear" INTEGER,
        "bathrooms" INTEGER,
        "floor" INTEGER,
        "roomStructure" VARCHAR(50),
        "heating" VARCHAR,
        "contractNumber" VARCHAR(100),
        "cadastralParcel" VARCHAR(100),
        "cadastralMunicipality" VARCHAR(100),
        "orientation" VARCHAR,
        "youtubeUrl" VARCHAR,
        "specialOffer" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "clientId" uuid,
        CONSTRAINT "FK_properties_client" FOREIGN KEY ("clientId") 
          REFERENCES "clients"("id") ON DELETE SET NULL
      )
    `);

    // Create property_images table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "property_images" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "url" VARCHAR NOT NULL,
        "order" INTEGER DEFAULT 0,
        "isFavorite" BOOLEAN DEFAULT false,
        "propertyId" uuid NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_property_images_property" FOREIGN KEY ("propertyId") 
          REFERENCES "properties"("id") ON DELETE CASCADE
      )
    `);

    // Create newsletter_subscribers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR NOT NULL UNIQUE,
        "name" VARCHAR,
        "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "isActive" BOOLEAN DEFAULT true,
        "unsubscribeToken" VARCHAR UNIQUE,
        CONSTRAINT "UQ_newsletter_email" UNIQUE ("email")
      )
    `);

    // Create agent_conversations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_conversations" (
        "id" SERIAL PRIMARY KEY,
        "guestName" VARCHAR,
        "guestEmail" VARCHAR,
        "guestPhone" VARCHAR,
        "initialMessage" TEXT,
        "userId" INTEGER,
        "agentId" INTEGER,
        "status" VARCHAR DEFAULT 'waiting',
        "unreadCount" INTEGER DEFAULT 0,
        "locale" VARCHAR(10) DEFAULT 'sr',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create agent_messages table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_messages" (
        "id" SERIAL PRIMARY KEY,
        "conversationId" INTEGER NOT NULL,
        "senderId" INTEGER,
        "senderType" VARCHAR DEFAULT 'guest',
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_agent_messages_conversation" FOREIGN KEY ("conversationId") 
          REFERENCES "agent_conversations"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_messages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_conversations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "newsletter_subscribers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "property_images" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "properties" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "representatives" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
  }
}
