import { User, IUser } from '../models/User';
import { Barbero } from '../models/Barbero';
import { sendConfirmationEmail } from '../utils/emailSender';
import crypto from 'crypto';
import bcrypt from 'bcrypt';


export async function getUserById(id: number) {
    return await User.query().findById(id);
}

export async function getAllUsers() {
    return await User.query().select();
}

export async function createUser(data: Partial<User>) {
    const authToken = crypto.randomBytes(32).toString('hex');
     const hashedPassword = await bcrypt.hash(data.contrasena!, 10);

    const user = await User.query().insert({
        ...data,
        contrasena: hashedPassword,
        rol: data.rol || 'user',
        auth_token: authToken,
        is_verified: false,
    });

    await sendConfirmationEmail(user.email, authToken);

    const { auth_token, ...safeUser } = user;
    return safeUser;
}

export async function deleteUser(id: number) {
    return await User.query().deleteById(id);
}

export async function updateUser(data: Partial<IUser>, userId: number) {
    try {
        return await User.query().patchAndFetchById(userId, data);
    } catch (error) {
        console.error(`Error al actualizar usuario ${userId}:`, error);
        throw error;
    }
}

export async function confirmUser(token: string) {
    const user = await User.query().findOne({ auth_token: token });
    if (!user) {
        throw new Error('Invalid token');
    }
    const updatedUser = await User.query().patchAndFetchById(user.id, { is_verified: true, auth_token: null });
    return updatedUser;
}

export async function getUserByEmail(email: string) {
    return await User.query().findOne({ email });
}

export async function getBarberoById(id: number) {
    return await Barbero.query().findById(id);
}