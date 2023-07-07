/** BizTime express application. */


import express, { json } from "express";

const app = express();
import ExpressError from "./expressError";

app.use(json());


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


export default app;
