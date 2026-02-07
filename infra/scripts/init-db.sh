#!/bin/bash
# =============================================================================
# PostgreSQL Initialization Script
# =============================================================================
# This script runs automatically when the PostgreSQL container is first created.
# It sets up the required databases for Temporal.
# =============================================================================

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create visibility database if it doesn't exist
    SELECT 'CREATE DATABASE temporal_visibility'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'temporal_visibility')\gexec

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE temporal TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE temporal_visibility TO $POSTGRES_USER;

    -- Log completion
    SELECT 'Temporal databases initialized successfully' AS status;
EOSQL
