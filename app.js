/** BizTime express application. */

import express, { json } from "express";
import companiesRoutes from "./routes/companies.js"
import invoicesRoutes from "./routes/invoices.js"
import ExpressError from "./expressError.js";

const app = express();

app.use(json());

app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500);

  return res.json({
    error: err.status,
    message: err.message
  });
});


export default app;
