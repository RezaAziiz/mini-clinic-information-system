import api from './api';

const medicalRecordService = {
    getByPatientId: async (patientId) => {
        return await api.get(`/medical-records/${patientId}`);
    },
    create: async (data) => {
        return await api.post('/medical-records', data);
    }
};

export default medicalRecordService;
