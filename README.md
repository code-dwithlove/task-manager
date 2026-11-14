
## Deployment Checklist

Before deploying the application to production:

### 1. Secrets
- Generate a strong random DB_PASSWORD.
- Generate a strong JWT_SECRET.
- Store production secrets in the server's .env file.
- Never reuse local development secrets.

### 2. Database
- Remove the PostgreSQL public port mapping.
- Keep PostgreSQL accessible only inside Docker.

### 3. CORS and API Configuration
- Set CORS_ORIGINS to the production frontend URL.
- Set VITE_API_URL to the production backend URL.
- Rebuild the frontend after changing environment variables.

### 4. HTTPS
- Configure Caddy or Nginx as a reverse proxy.
- Obtain a free Let's Encrypt SSL certificate.
- Ensure authentication traffic uses HTTPS.

### 5. Database Migrations
- Change spring.jpa.hibernate.ddl-auto from update to validate.
- Learn and configure Flyway migrations.
- Avoid relying on Hibernate automatic schema updates in production.

### 6. Database Backups
Create PostgreSQL backups regularly:

```bash
docker exec taskmanager-db pg_dump -U postgres taskmanager > backup.sql
```

- Store backups safely.
- Test database restoration periodically.
