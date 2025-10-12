import express from 'express';
const router = express.Router();
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';
import { 
  addOrderItems, 
  getOrderById, 
  updateOrderToPaid, 
  updateOrderToDelivered, 
  getMyOrders, 
  getAllOrders, 
  checkProductPurchase 
} from '../controller/orderController.js';

router.route('/')
  .post(verifyUserAuth, addOrderItems)
  .get(verifyUserAuth, roleBasedAccess('admin'), getAllOrders);

router.route('/myorders')
  .get(verifyUserAuth, getMyOrders);

router.route('/:id')
  .get(verifyUserAuth, getOrderById);

router.route('/:id/pay')
  .put(verifyUserAuth, updateOrderToPaid);

router.route('/:id/deliver')
  .put(verifyUserAuth, roleBasedAccess('admin'), updateOrderToDelivered);

router.route('/:productId/check-purchase')
  .get(verifyUserAuth, checkProductPurchase);

export default router;
