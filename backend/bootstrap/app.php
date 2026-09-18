<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
        ]);
        $middleware->api(append: [
            \App\Http\Middleware\ForceJson::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $e) => $request->is('api/*') || $request->is('auth/*') || $request->is('optimize-energy') || $request->is('health') || $request->expectsJson());
        $exceptions->render(function (Throwable $e, Request $request) {
            if (!$request->is('api/*') && !$request->is('auth/*') && !$request->is('optimize-energy') && !$request->is('health') && !$request->expectsJson()) {
                return null;
            }
            $status = $e instanceof AuthenticationException
                ? 401
                : ($e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500);
            return response()->json([
                'message' => $status === 500 ? 'An internal server error occurred.' : $e->getMessage(),
            ], $status);
        });
    })->create();
