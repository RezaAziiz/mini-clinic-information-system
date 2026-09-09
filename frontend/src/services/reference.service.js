import api from './api';

export const referenceService = {
    getDoctors: async () => {
        return await api.get('/doctors'); // Asumsi API dokter tersedia
    },
    
    getPolyclinics: async () => {
        return await api.get('/polyclinics'); // Asumsi API poliklinik tersedia
    }
};
