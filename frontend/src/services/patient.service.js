import api from './api';

export const patientService = {
    getAll: async (params) => {
        return await api.get('/patients', { params });
    },
    
    getById: async (id) => {
        return await api.get(`/patients/${id}`);
    },
    
    create: async (data) => {
        return await api.post('/patients', data);
    },
    
    update: async (id, data) => {
        return await api.put(`/patients/${id}`, data);
    },
    
    delete: async (id) => {
        return await api.delete(`/patients/${id}`);
    }
};
