export const getTestHost = () => {
    // Determine the host based on environment or default to localhost
    // Using a dynamic default allows running tests against different environments if needed
    return process.env.TEST_HOST || 'http://localhost';
};

/**
 * Creates a Request object for use in API route tests.
 * @param path The absolute path of the API route (e.g., '/api/library/status')
 * @param options Request options including method, body, params, and headers
 */
export const createTestRequest = (path: string, options: {
    method?: string;
    body?: any;
    params?: Record<string, string>;
    headers?: Record<string, string>;
} = {}) => {
    const url = new URL(path, getTestHost());

    if (options.params) {
        Object.entries(options.params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                url.searchParams.append(k, v);
            }
        });
    }

    return new Request(url.toString(), {
        method: options.method || 'GET',
        body: options.body ? JSON.stringify(options.body) : undefined,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers,
        },
    });
};
