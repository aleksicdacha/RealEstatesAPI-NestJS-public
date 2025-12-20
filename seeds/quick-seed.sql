-- Quick SQL seed for Real Estate API
-- Run this with: docker exec -i estates_postgres psql -U postgres -d estates < seeds/quick-seed.sql

-- Insert admin user (password: admin123 - hashed with bcrypt)
INSERT INTO "user" (username, password, role) VALUES
('admin', '$2b$10$.hspkMNxPoQZgPbMTxwfK.iQ8LXSI/LSK2.FmBgwvkyWrE7kJjk2O', 'admin'),
('manager', '$2b$10$K/7RRGlHrnBjg7ys3cBSau.tAZ7.yslogEqL6yEoMoXHMTEtPfot.', 'admin'),
('agent1', '$2b$10$K/7RRGlHrnBjg7ys3cBSau.tAZ7.yslogEqL6yEoMoXHMTEtPfot.', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert sample properties
INSERT INTO property (code, "propertyType", status, price, "salePrice", area, address, lat, lon, comment, elevator, bathrooms, floor, heating, "constructionYear", description, "createdAt", "updatedAt") VALUES
('PROP001', 'Apartment', 'active', 150000, 140000, 85.5, 'Kralja Petra 123, Belgrade', 44.8176, 20.4633, 'Close to public transport', true, 1, 4, 'Central', 2018, 'Beautiful 3-room apartment in city center with modern amenities', NOW(), NOW()),
('PROP002', 'House', 'active', 250000, 245000, 120, 'Dunavska 456, Novi Sad', 45.2671, 19.8335, 'Quiet neighborhood', false, 2, 0, 'Gas central', 2015, 'Spacious family house with garden and garage', NOW(), NOW()),
('PROP003', 'Apartment', 'inactive', 95000, 95000, 55, 'Kneza Miloša 789, Belgrade', 44.8074, 20.4577, 'Renovated', true, 1, 2, 'Central', 2020, 'Cozy 2-room apartment, recently renovated', NOW(), NOW()),
('PROP004', 'Office', 'active', 75000, 72000, 35, 'Bulevar Kralja Aleksandra 45, Belgrade', 44.8021, 20.4750, 'Perfect for small business', true, 1, 3, 'Electric central', 2019, 'Modern office space near city center', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert sample clients (we need property UUIDs, so we'll just insert without propertyId for now)
INSERT INTO client (name, address, email, phone, "transactionType", "paymentType", status, comment, "moneyAmount") VALUES
('John Doe', 'Bulevar oslobođenja 100, Belgrade', 'john.doe@email.com', '+381641234567', 'buyer', 'cash', 'active', 'Looking for apartment in city center', 150000),
('Jane Smith', 'Maksima Gorkog 22, Novi Sad', 'jane.smith@email.com', '+381641234568', 'rents', 'credit', 'active', 'Needs 2-bedroom apartment', NULL),
('Mike Johnson', 'Kneza Miloša 56, Belgrade', 'mike.j@email.com', '+381641234569', 'buyer', 'combined', 'active', 'Interested in house with garden', 250000),
('Sarah Williams', 'Cara Dušana 12, Niš', 'sarah.w@email.com', '+381641234570', 'seller', 'cash', 'active', 'Selling inherited property', 180000)
ON CONFLICT DO NOTHING;

SELECT 'Seed completed successfully!' AS message;
