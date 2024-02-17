import jwt from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";

export const auth = (accessRoles) => {
  return async (req, res, next) => {
    try {
      const { accesstoken } = req.headers;
      if (!accesstoken)
        return next(new Error("please login first", { cause: 400 }));

      if (!accesstoken.startsWith(process.env.TOKEN_PREFIX))
        return next(new Error("invalid token prefix", { cause: 400 }));

      const token = accesstoken.split(process.env.TOKEN_PREFIX)[1];

      const decodedData = jwt.verify(token, process.env.JWT_SECRET_LOGIN);

      if (!decodedData || !decodedData.id)
        return next(new Error("invalid token payload", { cause: 400 }));

      // user check
      const findUser = await User.findById(
        decodedData.id,
        "username email role"
      ); // loggdInUser ROle
      if (!findUser)
        return next(new Error("please signUp first", { cause: 404 }));
      // auhtorization
      if (!accessRoles.includes(findUser.role))
        return next(new Error("unauthorized", { cause: 401 }));
      req.authUser = findUser;
      next();
    } catch (error) {
      console.log(error);
      next(new Error("catch error in auth middleware", { cause: 500 }));
    }
  };
};
