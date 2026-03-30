// Authentication Utility (Demo)
const Auth = {
    login(nickname) {
        localStorage.setItem('userNickname', nickname);
        return { nickname };
    },
    logout() {
        localStorage.removeItem('userNickname');
    },
    getUser() {
        return localStorage.getItem('userNickname') || null;
    }
};

export default Auth;
