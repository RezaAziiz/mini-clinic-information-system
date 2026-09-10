import api from './api';

const dashboardService = {
    getSummary: async () => {
        return await api.get('/dashboard');
    },
};

export default dashboardService;
