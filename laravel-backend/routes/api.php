<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\TicketController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Seller Routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/categories', [ProductController::class, 'categories']);
    Route::post('/seller/orders', [OrderController::class, 'store']);
    Route::get('/seller/orders', [OrderController::class, 'index']);
    Route::post('/seller/deposits', [DepositController::class, 'store']);
    Route::get('/seller/tickets', [TicketController::class, 'index']);
    Route::post('/seller/tickets', [TicketController::class, 'store']);

    // Admin Routes
    Route::middleware('admin')->group(function () {
        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::get('/admin/orders', [OrderController::class, 'allOrders']);
        Route::post('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::get('/admin/deposits', [DepositController::class, 'allDeposits']);
        Route::post('/admin/deposits/{id}/approve', [DepositController::class, 'approve']);
        Route::post('/admin/deposits/{id}/reject', [DepositController::class, 'reject']);
        Route::get('/admin/tickets', [TicketController::class, 'allTickets']);
        Route::post('/admin/tickets/{id}/reply', [TicketController::class, 'reply']);
        Route::get('/admin/stats', [OrderController::class, 'stats']);
    });
});
