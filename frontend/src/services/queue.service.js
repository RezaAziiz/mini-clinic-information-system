import api from './api';

const queueService = {
    getAll: async (params) => {
        return await api.get('/queues', { params });
    },
    create: async (data) => {
        return await api.post('/queues', data);
    },
    callQueue: async (id) => {
        return await api.put(`/queues/${id}/call`);
    },
    updateStatus: async (id, queueStatus) => {
        return await api.put(`/queues/${id}/status`, { queueStatus });
    },
};

export default queueService;
