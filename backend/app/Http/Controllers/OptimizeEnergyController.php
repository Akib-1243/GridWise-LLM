<?php

namespace App\Http\Controllers;

use App\Http\Requests\OptimizeEnergyRequest;
use App\Services\EnergyOptimizer;
use Illuminate\Http\JsonResponse;

class OptimizeEnergyController extends Controller
{
    public function __invoke(OptimizeEnergyRequest $request, EnergyOptimizer $optimizer): JsonResponse
    {
        return response()->json($optimizer->optimize($request->validated()));
    }
}
