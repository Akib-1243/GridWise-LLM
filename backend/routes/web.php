<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\OptimizeEnergyController;
use App\Http\Middleware\Cors;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

Route::middleware([\App\Http\Middleware\ForceJson::class, Cors::class])
	->withoutMiddleware(ValidateCsrfToken::class)
	->group(function () {
	Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');
	Route::get('/health', HealthController::class);
	Route::post('/optimize-energy', OptimizeEnergyController::class);
});
