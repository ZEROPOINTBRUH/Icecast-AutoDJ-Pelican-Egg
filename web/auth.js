// AutoDJ Extreme - Authentication System
const AUTH_STORAGE_KEY = 'autodj_auth';
const AUTH_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

class AuthSystem {
    constructor() {
        this.isAuthenticated = false;
        this.username = null;
        this.loadAuth();
    }

    // Load authentication from localStorage
    loadAuth() {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                const auth = JSON.parse(stored);
                const now = Date.now();
                
                // Check if auth is still valid
                if (auth.expiry > now) {
                    this.isAuthenticated = true;
                    this.username = auth.username;
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to load auth:', error);
        }
        
        this.logout();
        return false;
    }

    // Save authentication
    saveAuth(username) {
        const auth = {
            username: username,
            expiry: Date.now() + AUTH_EXPIRY,
            timestamp: Date.now()
        };
        
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        this.isAuthenticated = true;
        this.username = username;
    }

    // Login function
    async login(username, password) {
        try {
            // Create Basic Auth header
            const credentials = btoa(`${username}:${password}`);
            
            // Test authentication against Icecast admin
            const response = await fetch('/admin/', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });

            if (response.ok || response.status === 200) {
                this.saveAuth(username);
                return { success: true, message: 'Login successful!' };
            } else if (response.status === 401) {
                return { success: false, message: 'Invalid username or password' };
            } else {
                return { success: false, message: 'Authentication server error' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Connection failed. Please try again.' };
        }
    }

    // Logout function
    logout() {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        this.isAuthenticated = false;
        this.username = null;
    }

    // Get auth header for API requests
    getAuthHeader() {
        if (!this.isAuthenticated) {
            return null;
        }
        
        // For Icecast admin API, we need Basic Auth
        // User should store their password securely (not implemented for security)
        return null; // Return null for now, use session-based auth
    }

    // Check if user has admin privileges
    isAdmin() {
        return this.isAuthenticated && this.username === 'admin';
    }
}

// Glob auth instance
const auth = new AuthSystem();

// Show/hide login modal
function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function hideLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginPassword').value = '';
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('loginError');
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    errorMsg.classList.add('hidden');
    
    // Attempt login
    const result = await auth.login(username, password);
    
    if (result.success) {
        hideLoginModal();
        updateUIForAuth();
        showNotification('✅ ' + result.message, 'success');
        
        // Reload data
        updateNowPlaying();
        updateStats();
    } else {
        errorMsg.textContent = result.message;
        errorMsg.classList.remove('hidden');
    }
    
    // Reset button
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        updateUIForAuth();
        showNotification('👋 Logged out successfully', 'success');
    }
}

// Update UI based on auth state
function updateUIForAuth() {
    const adminControls = document.querySelectorAll('.admin-only');
    const loginBtn = document.getElementById('loginButton');
    const logoutBtn = document.getElementById('logoutButton');
    const userDisplay = document.getElementById('userDisplay');
    
    if (auth.isAuthenticated) {
        // Show admin controls
        adminControls.forEach(el => el.classList.remove('hidden'));
        
        // Update buttons
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (userDisplay) {
            userDisplay.textContent = auth.username;
            userDisplay.classList.remove('hidden');
        }
        
        // Show admin badge
        document.querySelector('.status-indicator span')?.insertAdjacentHTML('afterend', 
            '<span class="admin-badge">🔑 Admin</span>'
        );
    } else {
        // Hide admin controls
        adminControls.forEach(el => el.classList.add('hidden'));
        
        // Update buttons
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (userDisplay) userDisplay.classList.add('hidden');
        
        // Remove admin badge
        document.querySelector('.admin-badge')?.remove();
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUIForAuth();
    
    // Add event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', showLoginModal);
    }
    
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideLoginModal);
    }
    
    // Close modal on backdrop click
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideLoginModal();
            }
        });
    }
});

// Export auth instance
window.authSystem = auth;
