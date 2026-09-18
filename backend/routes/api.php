<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\OptimizeEnergyController;
use App\Http\Middleware\Cors;
use Illuminate\Support\Facades\Route;

Route::middleware(Cors::class)->group(function () {
	Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');
	Route::get('/health', HealthController::class);
	Route::post('/optimize-energy', OptimizeEnergyController::class);
});
