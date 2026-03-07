const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchSystemHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching system health:', error);
        return null;
    }
};

export const fetchActivityFeed = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/activity`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching activity feed:', error);
        return [];
    }
};
