import express from 'express';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import {newsRouter} from "./news/news.router.js";
import * as path from "path";
import {HttpException} from "./exceptions/http.exception.js";

export class App {
  init() {
    const __dirname = dirname(fileURLToPath(import.meta.url));

    dotenv.config({
      path: path.join(__dirname, '..', '.env')
    })

    this.port = process.env.PORT || 3000;

    this.server = express();

    this.server.use('/news', newsRouter());
    this.server.use(this.onError);

    return this;
  }

  run () {
    this.server.listen(this.port, () => console.log(`Server is running on port ${this.port}`));
  }

  onError(err, req, res, next) {
    if(res.headersSent) {
      return next(req);
    }

    if(err instanceof HttpException) {
      return res.status(err.code).send({message: err.message});
    }

    const message = process.env.DEBUG === "true" ?
      {message: err.message, stack: err.stack} :
      {message: err.message};

    return res.status(500).send(message);
  }
}
