//  UserController.ts
import { User } from "../models/user";

let getUser = (arg: { id: number }): User => { return { id: arg.id, name: "user" } };
let putUser = (arg: { id: number, user: User }) => { console.log(arg) };
let postUser = (user: { name: string }): User => { return { id: 1, name: user.name } };
const userController = {
    getUser,
    putUser,
    postUser
};
export default userController;