(function() {
    const token = localStorage.getItem('pkp_token');
    const isLoginPage = window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/signup.html');

    if (!token && !isLoginPage) {
        console.log('Auth guard: No token found, redirecting to login.');
        window.location.href = '/login.html';
    }
})();