// Dream Pattern Analyzer - Simple Auth (Demo Only)

function setUser(username) {
    localStorage.setItem('dreamUser', username);
}

function getUser() {
    return localStorage.getItem('dreamUser') || null;
}

function logoutUser() {
    localStorage.removeItem('dreamUser');
}

window.DreamAuth = { setUser, getUser, logoutUser };
