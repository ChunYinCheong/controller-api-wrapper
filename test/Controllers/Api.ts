// Api.ts
import { wrapControllers } from '../../index';
import userController from './UserController';
import productController from './ProductController';
import carController from './CarController';

export const controllers = {
    userController,
    productController,
    carController
}
const ApiWrapper = wrapControllers(controllers);
export default ApiWrapper;