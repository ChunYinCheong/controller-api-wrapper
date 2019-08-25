//  UserController.ts
import { User } from "../Models/User";

let getUser = (id: number): User => { return { id, name: "user" } };
let putUser = (arg: { id: number, user: User }) => { };
let postUser = (user: { name: string }): User => { return { id: 1, name } };
const userController = {
    getUser,
    putUser,
    postUser
};
export default userController;