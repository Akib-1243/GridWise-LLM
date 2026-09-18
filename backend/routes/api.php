<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\OptimizeEnergyController;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\Cors;
use Illuminate\Support\Facades\Route;

Route::middleware(Cors::class)->group(function () {
	Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');
	Route::get('/health', HealthController::class);
	Route::post('/auth/register', [AuthController::class, 'register']);
	Route::post('/auth/login', [AuthController::class, 'login']);
	Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
	Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
	Route::post('/optimize-energy', OptimizeEnergyController::class);
	Route::middleware('auth:sanctum')->group(function (): void {
	    Route::get('/auth/me', [AuthController::class, 'me']);
	    Route::post('/auth/logout', [AuthController::class, 'logout']);
	    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
	    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
	    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
	});
});
