
import JwtHelper from "../utils/jwtHelper.js";

export const auth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Bearer ")) {
        try {
            const token = authorization.split(' ')[1];
            req.user = await JwtHelper.verifyUserAccessToken(token);
            next();
        } catch (error) {
            return res.error(401, "Unauthorized User", null);
        }
    } else {
        return res.error(401, "Authorization header is missing or invalid", null);
    }
};
