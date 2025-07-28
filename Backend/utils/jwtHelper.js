
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../configs/envConfig.js";
import UserModel from "../models/user.js";

class JwtHelper {
    static generateAccessToken = (user) => {
        const payload = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '30d' });
    };

    static createAccessToken = (userId) => {
        const payload = { _id: userId };
        return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '30d' });
    };

    static verifyUserAccessToken = async (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET_KEY);
            const user = await UserModel.findById(decoded._id).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error('Invalid token');
        }
    };
}

export default JwtHelper;
