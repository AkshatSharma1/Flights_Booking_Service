#!/bin/sh

echo "Check/Create Database..."
npx sequelize-cli db:create || true

echo "Running Migrations..."
npx sequelize-cli db:migrate

# --- NEW: Run Seeds ---
echo "Running Seeds..."
npx sequelize-cli db:seed:all || true  # '|| true' prevents crash if seeds fail/duplicate
# ----------------------

echo "Starting Server..."
npm start