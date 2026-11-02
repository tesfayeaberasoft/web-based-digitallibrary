# Deploying to InfinityFree

This deployment layout serves the React build from `htdocs/` and the PHP
backend from `htdocs/backend/`. The React app calls the backend at
`https://your-site.example/backend/api/...`.

InfinityFree's free plan is best suited to a demo or student project. Do not
store real member, payment, or loan data there without independently verifying
the provider's security, backup, and availability guarantees.

## 1. Create the hosting account and database

1. Create an InfinityFree account and a hosting account. Choose a free domain
   or connect a domain you own.
2. In the hosting control panel, create a MySQL database.
3. Record the exact database host, database name, username, and password shown
   by the control panel. Do not assume the host is `localhost`; shared hosts
   commonly provide a separate database hostname.
4. Open phpMyAdmin for that database, select the database in the left sidebar,
   and import `database/schema.sql` from its **Import** tab. The schema only
   creates tables in the selected database; it does not try to create a
   database, which shared hosting accounts are not allowed to do.
5. If you already attempted an import, inspect the selected database's table
   list first. If the tables are present, do not import again. The schema uses
   `CREATE TABLE IF NOT EXISTS` so retrying can add missing tables without
   dropping existing tables or data. It does not add columns to existing
   tables. For a database created from the earlier schema, inspect the `fines`
   columns and table list; if the payment fields/tables are absent, import
   `database/migrate-existing-infinityfree-payments.sql` once. Do not run it
   when those columns or tables already exist. Also check for
   `books.condition_status`; if it is missing, run
   `backend/migrations/add_condition_status_column.sql` once in phpMyAdmin.
6. To add starter catalog data, select the database in phpMyAdmin and import
   `database/sample_data_infinityfree.sql`. Do not import the general
   `database/sample_data.sql` on production: it contains demo accounts and
   assumes fixed record IDs. The InfinityFree seed adds categories and books
   only; register and promote your own administrator account separately.

## 2. Configure and build React

1. Copy `frontend/.env.production.example` to
   `frontend/.env.production.local`.
2. Replace `your-site.example` with the exact HTTPS hostname assigned to your
   InfinityFree site. Use the same hostname for the frontend and backend.
3. Set the Google OAuth client ID and Chapa public key if those features are
   configured. The Chapa **secret** key must only be stored in the PHP
   environment file.
4. From the repository root, build the frontend:

   ```powershell
   Set-Location frontend
   npm ci
   npm run build
   ```

5. Upload the **contents** of `frontend/build/` into `htdocs/`. The upload
   should place `index.html`, `static/`, `manifest.json`, and the service
   worker directly in `htdocs/`, not inside an extra `build` directory.
6. Upload the repository-root `.htaccess` into `htdocs/`. The rewrite rules
   also forward Authorization bearer headers to PHP, which protected API calls
   require on shared hosting.
7. Verify `manifest.json`, `sw.js`, and both `digital-library-icon-*.png`
   files load over HTTPS. Chrome/Edge on desktop and Android can show the
   native install prompt when the browser considers the PWA installable.
   JavaScript cannot force that prompt when the browser does not emit
   `beforeinstallprompt`. iPhone/iPad users must install through Safari's
   **Share → Add to Home Screen** flow.

The frontend reads `REACT_APP_API_URL` at build time. Rebuild after changing
that setting.

## 3. Upload the PHP backend

1. Install the PHP dependencies from the repository root:

   ```powershell
   Set-Location backend
   composer install --no-dev --prefer-dist --optimize-autoloader
   ```

2. Upload the contents of `backend/` into `htdocs/backend/`, including
   `.htaccess` and the generated `vendor/` directory. PHPMailer is required
   by the notification service. Do **not** upload local logs, private storage,
   database dumps, or any local `.env` file.
3. In `htdocs/backend/`, create a server-side `.env` file using
   `backend/.env.example` as a checklist. Enter the database details from the
   control panel and create fresh production secrets. `JWT_SECRET` must be a
   random value of at least 32 characters. Set:

   ```dotenv
   APP_DEBUG=false
   APP_BASE_URL=https://your-site.example
   API_PUBLIC_URL=https://your-site.example/backend
   DB_HOST=the_database_host_from_the_control_panel
   DB_NAME=the_database_name_from_the_control_panel
   DB_USER=the_database_username_from_the_control_panel
   DB_PASS=the_database_password_from_the_control_panel
   CORS_ALLOWED_ORIGINS=https://your-site.example
   CHAPA_CALLBACK_URL=https://your-site.example/backend/api/payments/callback
   CHAPA_RETURN_URL=https://your-site.example/payment/return
   ```

4. Keep `.env` inaccessible over HTTP. The supplied `backend/.htaccess` blocks
   dotfiles and backend implementation directories. Verify this after upload
   by requesting `https://your-site.example/backend/.env`; it must not return
   environment contents.
5. Upload the repository-root `private-storage/.htaccess` into
   `htdocs/private-storage/.htaccess`. The app stores ebook files under
   `htdocs/private-storage/ebooks/` and streams them only through its
   authenticated API endpoint. Both the root rewrite rule and this directory
   rule prevent direct downloads. Ensure PHP can write to
   `htdocs/backend/uploads/` and `htdocs/private-storage/ebooks/`; do not make
   either directory world-writable.

## 4. Configure external integrations

- Add the deployed HTTPS origin to the Google OAuth client's authorized
  JavaScript origins. Keep the matching client ID in the frontend build and
  PHP environment.
- Configure Chapa with the production secret on the server only, and use the
  public callback URL above. Test callbacks and return handling before using
  live payments.
- Review upload-size and file-type limits against the provider's PHP limits.
  User-uploaded files are stored under `backend/uploads/`; check that the host
  allows the app to create/write that directory.
- Check the host's `upload_max_filesize` and `post_max_size` before enabling
  ebook uploads. The app accepts ebooks up to 50 MB, but shared-host PHP limits
  may be lower and may not be user-configurable.
- Confirm PHP provides PDO MySQL and cURL. File uploads additionally use
  `fileinfo`, and EPUB validation/archive exports require `ZipArchive`; disable
  those features or use a host with the required extensions if unavailable.

## 5. Verify the deployment

1. Visit `https://your-site.example/` and confirm the React app loads.
2. Visit `https://your-site.example/backend/api/public/stats`; it should return
   JSON rather than a 404 or the React page. Upload both the root `.htaccess`
   and `backend/.htaccess` after any routing changes; those rules pass the API
   path explicitly to the PHP dispatcher.
3. Test registration, login, book browsing, file uploads, and all dashboard
   roles.
4. Test Google sign-in and Chapa only after configuring their production
   origins, URLs, keys, and payment tables.
5. Confirm the site and API use HTTPS, direct SPA routes load after refresh,
   and private files such as `.env` and SQL dumps cannot be downloaded.
6. Keep an independent database backup. Do not commit the backup to GitHub.
7. Test notification endpoints only after configuring SMTP/SendGrid credentials.
   The host may block outbound SMTP connections; verify email delivery on the
   hosting account before relying on reminders.

## Important limitations

The free plan may impose PHP, upload, database, outbound-request, or resource
limits. Payment callbacks, email providers, scheduled jobs, and large ebook
uploads may therefore require a different plan or host. The web server's
filesystem is not a substitute for backups.
