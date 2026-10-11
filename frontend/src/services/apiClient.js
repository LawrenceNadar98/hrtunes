import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Standard HTTP API client for backend communication
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    // Attach Firebase ID Token if user is authenticated
    if (auth && auth.currentUser) {
        try {
            const token = await auth.currentUser.getIdToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        } catch {
            // Non-blocking: continue if token fetch fails
        }
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
            const error = new Error(errorMsg);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        if (err.status) throw err;
        // Network or offline connection errors
        const netErr = new Error(
            `Unable to reach backend server at ${API_BASE_URL}. Please ensure backend is running.`
        );
        netErr.status = 0;
        netErr.originalError = err;
        throw netErr;
    }
}

export const apiClient = {
    get: (endpoint, headers) => request(endpoint, { method: "GET", headers }),
    post: (endpoint, body, headers) =>
        request(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
            headers
        }),
    getBaseUrl: () => API_BASE_URL
};

export default apiClient;
