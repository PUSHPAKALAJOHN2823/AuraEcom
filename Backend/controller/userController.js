import handleAsynError from "../middleware/handleAsynError.js";
import HandleError from "../utils/handleError.js";
import User from "../models/userModel.js";
import crypto from 'crypto';
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";

export const registerUser = handleAsynError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "This is temp_id",
      url: "This is temp url",
    },
  });

  sendToken(user, 201, res);
});

export const loginUser = handleAsynError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new HandleError("Email or password cannot be empty", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new HandleError("Invalid Email or Password", 401));
  }
  const isPasswordValid = await user.verifyPassword(password);
  if (!isPasswordValid) {
    return next(new HandleError("Invalid Email or Password", 401));
  }
  sendToken(user, 200, res);
});

export const logout = handleAsynError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Successfully Logged Out!",
  });
});

export const requestPasswordReset = handleAsynError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new HandleError("User doesn't exist", 400));
  }
  let resetToken;
  try {
    resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    return next(new HandleError("Could not save reset token, please try again later", 500));
  }
  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset/${resetToken}`;
  const message = `You requested to reset your password.\n\n
Please click on the link below (or copy & paste it in your browser) to reset your password:\n\n
${resetPasswordURL}\n\n
This link will expire in 30 minutes.\n\n
If you did not request this, please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email is sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new HandleError("Email couldn't be sent, please try again later", 500));
  }
});

export const resetPassword = handleAsynError(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new HandleError("Reset Password Token is invalid or has expired", 400));
  }
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(new HandleError("Password doesn't match, please check your password", 400));
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

export const getUserDetails = handleAsynError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updatePassword = handleAsynError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  const checkPasswordMatch = await user.verifyPassword(oldPassword);
  if (!checkPasswordMatch) {
    return next(new HandleError('Old Password is incorrect', 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new HandleError("Password doesn't match", 400));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

export const updateProfile = handleAsynError(async (req, res, next) => {
  const { name, email } = req.body;
  const updateUserDetails = { name, email };
  const user = await User.findByIdAndUpdate(req.user.id, updateUserDetails, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
    user,
  });
});

export const getUsersList = handleAsynError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

export const getSingleUser = handleAsynError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new HandleError('User not found', 404));
  res.status(200).json({
    success: true,
    user,
  });
});

export const deleteUser = handleAsynError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new HandleError('User not found', 404));
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

export const updateUser = handleAsynError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new HandleError('User not found', 404));
  res.status(200).json({
    success: true,
    user,
  });
});