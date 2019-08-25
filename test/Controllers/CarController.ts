// CarController.ts

let getCar = ({ }, r: { id: number }) => { return { id: r.id, name: "car" } };
let getCarValidator = ({ }, r: { id: number }) => { r.id === 1 ? null : "Error!" };
const getCarApi = {
    url: 'Car/:id',
    method: "get",
    handler: getCar,
    validator: getCarValidator
};
const carController = {
    getCar: getCarApi
}
export default carController;
