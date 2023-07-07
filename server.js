/** Server startup for BizTime. */


import { listen } from "./app";


listen(3000, function () {
  console.log("Listening on 3000");
});