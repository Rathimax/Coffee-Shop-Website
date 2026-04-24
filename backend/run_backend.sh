#!/bin/bash

# Load environment variables from .env file securely
if [ -f .env ]; then
    echo "Loading environment from .env..."
    # Read .env file line by line to avoid shell parsing issues with '&'
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Ignore comments and empty lines
        if [[ ! "$key" =~ ^# && -n "$key" ]]; then
            # Clean potential whitespace and export
            value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
            export "$key"="$value"
        fi
    done < .env
else
    echo "Warning: .env file not found."
fi

# Run the Spring Boot application
./mvnw spring-boot:run
