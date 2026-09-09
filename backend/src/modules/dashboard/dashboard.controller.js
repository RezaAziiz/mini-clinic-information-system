import dashboardService from './dashboard.service.js';

const getSummary = async (req, res, next) => {
    try {
        const summary = await dashboardService.getDashboardSummary();
        return res.success(summary, 'Data summary dashboard berhasil diambil');
    } catch (error) {
        next(error);
    }
};

export default {
    getSummary
};
