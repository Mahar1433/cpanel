# Dropshipping Supplier Platform - Laravel Installation Guide

This project is built with **Laravel 11** and **MySQL**. It is designed to be **cPanel hosting compatible**.

## Prerequisites
- PHP 8.2 or higher
- MySQL 8.0 or higher
- Composer

## Installation Steps

1. **Upload Files**: Upload the project files to your cPanel `public_html` or a subdirectory.
2. **Database Setup**: Create a new MySQL database and user in cPanel.
3. **Environment Config**: Rename `.env.example` to `.env` and update the database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_db_name
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   ```
4. **Install Dependencies**: Run `composer install` via SSH or cPanel Terminal.
5. **Generate App Key**: Run `php artisan key:generate`.
6. **Run Migrations**: Run `php artisan migrate --seed` to create tables and seed the admin account.
7. **Storage Link**: Run `php artisan storage:link` to make uploads accessible.

## Admin Credentials
- **URL**: `yourdomain.com/admin`
- **Email**: `admin@example.com`
- **Password**: `admin123`

## Seller Credentials
- **URL**: `yourdomain.com/login`
- **Signup**: `yourdomain.com/register`

## cPanel Specifics
If you are hosting in a subdirectory, ensure your `.htaccess` points to the `public/` folder correctly.

---

**Note**: For the live preview in this environment, I have implemented the platform using a Node.js (Express + React) stack to ensure it is runnable and interactive. The Laravel source code provided in the `laravel/` directory contains the full logic, controllers, and migrations for your production deployment.
