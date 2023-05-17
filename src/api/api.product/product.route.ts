import Router, { query } from "express";
import { Database } from "../../db/IDatabase";
const PRODUCTS_PER_FETCH = 100;

const productRouter = Router();

productRouter.get("/", (req, res) => {
  const page = req.query.page as string;
  if (!page) {
    res.send({ err: "PAGE NUMBER IS REQUIRED" });
    return;
  }
  const database = new Database();
  database.query(
    `Select productinfo.*, min(price) as price ,product.imageurl, product.price, sum(product.quantity) as quantity from productinfo inner join product on product.infoid = productinfo.id group by productinfo.id Limit ${PRODUCTS_PER_FETCH} offset ${
      PRODUCTS_PER_FETCH * Number.parseInt(page)
    }`,
    (err, result, fields) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});
productRouter.get("/category", (req, res) => {
  const database = new Database();

  database.query("Select * from category", (err, result, fields) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});
productRouter.get("/search", (req, res) => {
  const database = new Database();
  const category = req.query.category;
  const priceMax = req.query.maxPrice;
  const priceMin = req.query.minPrice;
  const color = req.query.color;
  console.log(color);
  database.query(`Select * from product`, (err, result, fields) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});
productRouter.get("/:infoid", (req, res) => {
  const database = new Database();
  database.query(
    `Select productinfo.*, product.* from product inner join productinfo on product.infoid = productinfo.id  where infoid = '${req.params.infoid}'
     
    `,
    (err, result, fields) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

export default productRouter;
