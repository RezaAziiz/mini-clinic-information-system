import api from './api';

const prescriptionService = {
    create: async (data) => {
        return await api.post('/prescriptions', data);
    }
};

export default prescriptionService;
