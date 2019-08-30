import { User } from "../models/user";
declare const userController: {
    getUser: (id: number) => User;
    putUser: (arg: {
        id: number;
        user: User;
    }) => void;
    postUser: (user: {
        name: string;
    }) => User;
};
export default userController;
