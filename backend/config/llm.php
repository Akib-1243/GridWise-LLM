<?php

return [
    'provider' => env('LLM_PROVIDER', 'mock'),
    'model' => env('LLM_MODEL', 'gpt-4o-mini'),
    'api_key' => env('OPENAI_API_KEY'),
    'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    'timeout' => (int) env('LLM_TIMEOUT', 8),
];