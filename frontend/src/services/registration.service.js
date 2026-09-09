import api from './api';

export const registrationService = {
    getAll: async (params) => {
        return await api.get('/registrations', { params });
    },
    
    getById: async (id) => {
        return await api.get(`/registrations/${id}`);
    },
    
    create: async (data) => {
        return await api.post('/registrations', data);
    },
    
    update: async (id, data) => {
        return await api.put(`/registrations/${id}`, data);
    },
    
    // Asumsi endpoint referensi (opsional jika backend punya, kalau belum kita biarkan komponen panggil api.get atau buat service lain)
    getDoctors: async () => {
        // Contoh jika suatu saat ada: return await api.get('/doctors');
        // Saat ini di aplikasi kita ambil dari data dummy/seeder jika ada, atau mungkin butuh service tersendiri
    },
    
    getPolyclinics: async () => {
        // Contoh jika suatu saat ada: return await api.get('/polyclinics');
    }
};
