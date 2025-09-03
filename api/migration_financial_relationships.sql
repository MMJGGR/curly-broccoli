-- Database migration for financial_relationships table
-- Run this before starting the application with the new relationships feature

CREATE TABLE IF NOT EXISTS financial_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id INTEGER NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    amount DECIMAL(15,2),
    percentage DECIMAL(8,6),
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    description VARCHAR(500),
    relationship_metadata JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_relationships_user_id ON financial_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_relationships_type ON financial_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_financial_relationships_source ON financial_relationships(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_financial_relationships_target ON financial_relationships(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_financial_relationships_status ON financial_relationships(status);

-- Insert sample data for testing (optional)
-- INSERT INTO financial_relationships (user_id, relationship_type, source_type, source_id, target_type, target_id, amount, frequency, status, description)
-- VALUES (1, 'asset_income', 'asset', 1, 'income', 1, 25000.00, 'monthly', 'active', 'Rental income from property');

COMMIT;