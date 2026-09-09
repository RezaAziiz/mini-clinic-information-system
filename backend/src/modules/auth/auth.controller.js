import authService from './auth.service.js';

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        return res.success(result, 'Login berhasil');
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const profile = await authService.getProfile(userId);

        return res.success(profile, 'Profil berhasil diambil');
    } catch (error) {
        next(error);
    }
};

export default { login, getProfile };
