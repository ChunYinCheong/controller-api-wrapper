import userController from "../controllers/UserController";

const user = {
    path: '/user',
    route: {
        get: {
            path: '/:id',
            method: 'get',
            handler: userController.getUser
        },
        post: {
            path: '',
            method: 'post',
            handler: userController.postUser
        },
        put: {
            path: '/:id',
            method: 'put',
            handler: userController.putUser
        }
    }
};

export default user;