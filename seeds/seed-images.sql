-- Seed property images
-- Clear existing images first (optional)
-- DELETE FROM property_images;

-- Get property IDs for reference
-- PROP001: 12662d91-7ccc-4e1b-ab8d-b88c8e21874b
-- PROP002: 1bab454c-8371-4bdf-8c0a-a0e00b7ffc0b
-- PROP003: df9d5820-a431-470e-90f3-6f7ae264a166
-- PROP004: df108f2f-484c-4c16-84e2-3b4aebb7803b

-- Images for PROP001 (Apartment in Belgrade)
INSERT INTO property_images (url, "order", "isFavorite", "propertyId") VALUES
('S001-1734637092803.jpg', 1, true, '12662d91-7ccc-4e1b-ab8d-b88c8e21874b'),
('S001-1734637092814.jpg', 2, false, '12662d91-7ccc-4e1b-ab8d-b88c8e21874b'),
('S001-1734637092840.jpg', 3, false, '12662d91-7ccc-4e1b-ab8d-b88c8e21874b')
ON CONFLICT DO NOTHING;

-- Images for PROP002 (House in Novi Sad)
INSERT INTO property_images (url, "order", "isFavorite", "propertyId") VALUES
('S002-1734642441023.jpg', 1, true, '1bab454c-8371-4bdf-8c0a-a0e00b7ffc0b'),
('S002-1734642441035.jpg', 2, false, '1bab454c-8371-4bdf-8c0a-a0e00b7ffc0b'),
('S002-1740761117321.jpg', 3, false, '1bab454c-8371-4bdf-8c0a-a0e00b7ffc0b')
ON CONFLICT DO NOTHING;

-- Images for PROP003 (Apartment in Belgrade)
INSERT INTO property_images (url, "order", "isFavorite", "propertyId") VALUES
('NEW0001-1759443287879.jpg', 1, true, 'df9d5820-a431-470e-90f3-6f7ae264a166'),
('NEW0001-1759443287884.jpg', 2, false, 'df9d5820-a431-470e-90f3-6f7ae264a166'),
('NEW0001-1759444436912.jpg', 3, false, 'df9d5820-a431-470e-90f3-6f7ae264a166')
ON CONFLICT DO NOTHING;

-- Images for PROP004 (Office in Belgrade)
INSERT INTO property_images (url, "order", "isFavorite", "propertyId") VALUES
('L001-1740742789497.jpg', 1, true, 'df108f2f-484c-4c16-84e2-3b4aebb7803b'),
('APT001-1759525506713.jpg', 2, false, 'df108f2f-484c-4c16-84e2-3b4aebb7803b'),
('TEST001-1759444337363.png', 3, false, 'df108f2f-484c-4c16-84e2-3b4aebb7803b')
ON CONFLICT DO NOTHING;

SELECT 'Property images seeded successfully!' as message;
