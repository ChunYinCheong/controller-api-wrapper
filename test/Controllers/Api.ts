// Api.ts
import userController from './UserController';
import productController from './ProductController';
import { wrapControllers } from '../../index';

const controllers = {
    userController,
    productController
}
const ApiWrapper = wrapControllers(controllers);
export default ApiWrapper;