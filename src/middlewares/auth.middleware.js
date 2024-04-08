import jwt from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";

export const auth = (accessRoles) => {
  return async (req, res, next) => {
    const { accesstoken } = req.headers;
    if (!accesstoken)
      return next(new Error("please login first", { cause: 400 }));
    //check prefix token
    if (!accesstoken.startsWith(process.env.TOKEN_PREFIX))
      return next(new Error("invalid token prefix", { cause: 400 }));
    //get token without prefix
    const token = accesstoken.split(process.env.TOKEN_PREFIX)[1];

    try {
      //decode token
      const decodedData = jwt.verify(token, process.env.JWT_SECRET_LOGIN);

      if (!decodedData.id)
        return next(new Error("invalid token payload", { cause: 400 }));
      // user check
      const findUser = await User.findById(
        decodedData.id,
        "username email role isLoggedIn"
      ); 
      if (!findUser)
        return next(new Error("please signUp first", { cause: 404 }));
        //if user change his password he must be loggin again
        if(!findUser.isLoggedIn){
          return res.status(400).json({
            succss:false,
            message:"You must log in again ,try later!"
          })
        }
      // auhtorization
      if (!accessRoles.includes(findUser.role))
        return next(new Error("unauthorized", { cause: 401 }));
      req.authUser = findUser;
      next();
    } catch (error) {
      //if token expired
      if (error == "TokenExpiredError: jwt expired") {
        const findUserWithToken = await User.findOne({ token });
        if (!findUserWithToken) return next(new Error("Wrong token!", { cause: 400 }));
        //generate refresh token
        const newToken = jwt.sign(
          { id: findUserWithToken._id, loggedIn: true },
          process.env.JWT_SECRET_LOGIN,
          // { expiresIn: "1d" }
        );
        //save current token in database
        findUserWithToken.token = newToken;
        await findUserWithToken.save();
        //send response
        return res.status(200).json({
          succss: true,
          message: "Token refreshed successfully!",
          newToken,
        });
      }
      next(new Error("catch error in auth middleware", { cause: 500 }));
    }
  };
};
