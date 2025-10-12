import express from 'express';
const router = express.Router();
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';
import { getUsersList, getSingleUser, updateUser, deleteUser } from '../controller/userController.js';

router.route('/users')
  .get(verifyUserAuth, roleBasedAccess('admin'), getUsersList);

router.route('/user/:id')
  .get(verifyUserAuth, roleBasedAccess('admin'), getSingleUser)
  .put(verifyUserAuth, roleBasedAccess('admin'), updateUser)
  .delete(verifyUserAuth, roleBasedAccess('admin'), deleteUser);

export default router;