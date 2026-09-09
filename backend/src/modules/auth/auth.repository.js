import prisma from '../../config/database.js';

const findUserByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email },
    });
};

const findUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

export default {
    findUserByEmail,
    findUserById,
};
