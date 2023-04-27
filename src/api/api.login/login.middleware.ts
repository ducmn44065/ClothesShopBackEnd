import { NextFunction, Request, Response } from "express";
import { Database, IDatabase, SQLResult } from "../../db/IDatabase";
import {
  generateToken,
  updateAccesstime,
  updateHost,
  updateToken,
} from "../../utils/utilities";
export function login(req: Request, res: Response) {
  const username: string = req.body.username;
  const hashpassword: string = req.body.password;

  const db: IDatabase = new Database();

  const querystring = `Select * from account where username = '${username}' and password = '${hashpassword}'`;

  try {
    db.query(querystring, (err, result, fields) => {
      if (err) {
        res.send({
          // send err to user.
          err,
        });
      } else {
        // if everything works fine.
        if (result.length != 1) {
          res.send({
            isAuthenticated: false,
            message: "Username or password is not correct.",
          });
        } else {
          const token = generateToken();
          updateToken(username, token);
          updateAccesstime(username);
          updateHost(username, req.headers.origin || "localhost");
          res.send({
            isAuthenticated: true,
            username,
            token,
            priority: result[0]["priority"],
            fullname: result[0]["fullname"],
          });
        }
      }
    });
  } catch (err) {
    res.send({
      err,
    });
  }
}

export function checkUserInfo(req: Request, res: Response, next: NextFunction) {
  const username: string = req.body.username || "";
  const hashpassword: string = req.body.password || "";
  if (!username || !hashpassword) {
    res.send({
      message: "Username and password must not be empty.",
      isAuthenticated: false,
    });
  } else {
    next();
  }
}

export function authenticateUser(req: Request, res: Response) {
  const database = new Database(process.env.SQL_STR);
  const token = req.query.token;
  const origin = req.headers.origin || "localhost";
  if (!token) {
    res.send({
      isAuthenticated: false,
    });
  }
  database.query(
    `Select * from account where host = '${origin}' and token = '${token}'`,
    (err, result, fields) => {
      if (result.length == 1) {
        const info = result[0];
        res.send({
          isAuthenticated: true,
          username: info["username"],
          fullname: info["fullname"],
          token,
          origin,
          priority: info["priority"],
        });
        return;
      }
      res.send({
        isAuthenticated: false,
      });
    }
  );
}
