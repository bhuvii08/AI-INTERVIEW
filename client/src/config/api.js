const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

export const ServerUrl = import.meta.env.VITE_SERVER_URL || `http://${browserHost}:8000`