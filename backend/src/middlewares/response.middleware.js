export const responseFormatter = (req, res, next) => {
    /**
     * Format response
     * @param {any} Data yang akan dikirim (default: null)
     * @param {string} message, Pesan sukses (default: 'Operasi berhasil')
     * @param {number} statusCode, HTTP status code (default: 200)
     */
    res.success = (data = null, message = 'Operasi berhasil', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    };

    next();
};
