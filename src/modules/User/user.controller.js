import jwt from "jsonwebtoken";

import User from "../../../DB/Models/user.model.js";
import sendEmailService from "../services/send-email.service.js";
import { systemRoles } from "../../utils/system-roles.js";

//============================================ update user ============================================//
export const updateUser = async (req, res, next) => {
  // 1- destructuring the request body
  const { username, email, age, phoneNumbers, addresses } = req.body;
  // 2- destructuring _id from the request authUser
  const { _id } = req.authUser;
  // 3- get user
  const user = await User.findById(_id);
  // 4- check if the user want to update the username field
  if (username) {
    // 4.1 check if the new category name different from the old name
    if (username == user.username) {
      return next({
        cause: 400,
        message: "Please enter different username from the existing one.",
      });
    }
    // 4.2- update the  username
    user.username = username;
  }
  // 5- check if the usre want to update the email field
  if (email) {
    // 5.1- check if the user already exists in the database using the email
    const isEmailDuplicated = await User.findOne({ email });
    if (isEmailDuplicated) {
      return next(
        new Error("Email already exists,Please try another email", {
          cause: 409,
        })
      );
    }
    // 5.2- send confirmation email to the user
    const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERFICATION, {
      expiresIn: "2m",
    });

    const isEmailSent = await sendEmailService({
      to: email,
      subject: "Email Verification",
      message: `
        <h2>please click on this link to verfiy your email</h2>
        <a href="http://localhost:3000/auth/verify-email?token=${usertoken}">Verify Email</a>
        `,
    });
    // 5.3- check if email is sent successfully
    if (!isEmailSent) {
      return next(
        new Error("Email is not sent, please try again later", { cause: 500 })
      );
    }
    // 5.4- put isEmailVerf & isLoggedIn file with fals
    user.isEmailVerified = false;
    user.isLoggedIn = false;
    // 5.5- update the email
    user.email = email;
  }
  // 6- check if the user want to update the age field
  if (age) {
    user.age = age;
  }
  // 7- check if the user want to update the phonNubmers field
  if (phoneNumbers) {
    user.phoneNumbers = phoneNumbers;
  }
  // 8- check if the user want to update the addresses field
  if (addresses) {
    user.addresses = addresses;
  }
  // 9- save the user in DB
  await user.save();
  // 10- send response
  res.status(200).json({
    success: true,
    message: "User updated successfully!",
    data: user,
  });
};

//============================================ delete user ============================================//
export const deleteUser = async (req, res, next) => {
  // 1- destructuring role & _id from the request authUser
  const { role, _id } = req.authUser;
  // 2- destructuring user id from query
  const { userId } = req.query;
  // 3- check role
  // 3.1-check if role is user or admin
  if (role == systemRoles.USER || role == systemRoles.ADMIN) {
    const deletedUser = await User.findByIdAndDelete(_id);
    if (!deletedUser)
      return next(
        new Error("Deleted account failed , try again!", { cause: 400 })
      );
  }
  // 3.2- check if role is superAdmin
  if (role == systemRoles.SUPER_ADMIN) {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser)
      return next(
        new Error(
          "Deleted account failed ,please enter userId you wanna delete!",
          { cause: 400 }
        )
      );
  }
  // 4- send respnse
  res
    .status(200)
    .json({ success: true, message: "User deleted successfully!" });
};

//============================================ get user profile data ============================================//
export const getUser = async (req, res, next) => {
  // 1- destructuring _id from the request authUser
  const { _id } = req.authUser;
  //serch user
  const user = await User.findById(_id);
  //send response
  res.status(200).json({ success: true, data: user });
};
