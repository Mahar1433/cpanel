# Dropshipping Supplier Platform - Installation Guide

This platform is built with **Laravel 10/11** and **React (Vite)**.

## Prerequisites
- PHP 8.1 or higher
- MySQL 5.7 or higher
- Composer
- Node.js & NPM (for frontend compilation)

## cPanel Installation Steps

1. **Upload Files:**
   - Upload the contents of the `laravel-backend` folder to your cPanel's `public_html` (or a subdirectory).
   - If you want to keep the Laravel core outside the public folder (recommended), upload everything except the `public` folder to your root directory and the contents of `public` into `public_html`.

2. **Database Setup:**
   - Create a new MySQL database in cPanel.
   - Create a database user and assign it to the database with all permissions.
   - Import the provided `database.sql` file using **phpMyAdmin**.

3. **Configuration:**
   - Rename `.env.example` to `.env`.
   - Edit `.env` and update the following:
     ```env
     APP_URL=https://yourdomain.com
     DB_DATABASE=your_db_name
     DB_USERNAME=your_db_user
     DB_PASSWORD=your_db_password
     
     # SMTP Settings for Emails
     MAIL_MAILER=smtp
     MAIL_HOST=mail.yourdomain.com
     MAIL_PORT=465
     MAIL_USERNAME=noreply@yourdomain.com
     MAIL_PASSWORD=your_email_password
     MAIL_ENCRYPTION=ssl
     MAIL_FROM_ADDRESS="noreply@yourdomain.com"
     ```

4. **Install Dependencies:**
   - Run `composer install --no-dev --optimize-autoloader`.
   - Run `php artisan key:generate`.
   - Run `php artisan storage:link`.

5. **Frontend Setup:**
   - The React frontend is pre-built in the `public` folder. If you make changes to the React source:
     - Run `npm install`.
     - Run `npm run build`.
     - Copy the contents of the `dist` folder to your Laravel `public` folder.

6. **Permissions:**
   - Ensure `storage` and `bootstrap/cache` folders are writable (chmod 775 or 755).

## Default Admin Credentials
- **Email:** admin@dropship.com
- **Password:** admin123 (Please change this immediately after login)

## Features
- **Seller Panel:** Dashboard, Wallet, Product Catalog, Order Management, Tickets.
- **Admin Panel:** Statistics, User Management, Product/Category Management, Order Fulfillment, Deposit Approval.
