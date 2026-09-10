import api from './api';

const doctorService = {
    getAll: async (params) => {
        return await api.get('/doctors', { params });
    },
    getMyProfile: async () => {
        return await api.get('/doctors/me');
    }
};

export default doctorService;
