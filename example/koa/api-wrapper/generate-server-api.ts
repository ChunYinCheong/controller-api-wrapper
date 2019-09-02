import { generateJs } from "controller-api-wrapper";
import routers from "../src/routers";

generateJs(routers, 'api-wrapper/generated/api-wrapper/server-api.js',`import { send } from "./server-api-helper";`);