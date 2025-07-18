async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('pkp_token');
    if (!token) {
        window.location.href = '/login.html';
        throw new Error('No auth token found. Redirecting to login.');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        window.location.href = '/login.html';
        throw new Error('Unauthorized. Redirecting to login.');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An API error occurred.');
    }

    return response.json();
}

export { fetchWithAuth };