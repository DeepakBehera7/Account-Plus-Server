//const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
require('dotenv').config()
console.log("dev")
console.log("root")
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Asdfghjkl@1",
  database: "products",
  dateStrings: 'date'
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(req.body, "in");
    cb(null, `${req.body.productId}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
/* app.use(
  '/',
  createProxyMiddleware({
    target: target,
    changeOrigin: true,
    logLevel: 'debug'
  })
); */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname ,'uploads')));


app.post("/thumbnailUpload", upload.single("productThumbnail"), (req, res) => {
  try {
    console.log(req.file) ;
    return res.json({ data: req.file.filename });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/products", (req, res) => {
    const q = "select * from product";
    db.query(q, (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });

app.post("/products", (req, res) => {
    const q = `insert into product(productId, productTitle, productDescription, productPrice, availableQuantity, productThumbnail)
      values(?)`;
    const values = [...Object.values(req.body)];
    console.log("insert", values);
    db.query(q, [values], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  
  app.get("/products/:productId", (req, res) => {
    const id = req.params.productId;
    const q = "SELECT * FROM product where productId=?";
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  
  app.put("/products/:productId", (req, res) => {
    const id = req.params.productId;
    console.log("updated " + req.body);
    const data = req.body;
    if (data.productPrice) data.productPrice = Number.parseInt(data.productPrice);
    if (data.availableQuantity)
      data.availableQuantity = Number.parseInt(data.availableQuantity);
    const q =
      "update product set " +
      Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(",") +
      " where productId='" +
      id +
      "'";
    console.log(q);
    db.query(q, [...Object.values(data)], (err, out) => {
      console.log(err, out);
      if (err) return res.json({ error: err.message });
      else {
        return res.json({ data: out });
      }
    });
  });
  
  app.delete("/products/:productId", (req, res) => {
    const id = req.params.productId;
    console.log("deleting " + id, req.body);
    const { productThumbnail } = req.body;
    console.log(req.body);
    const q = `DELETE FROM product WHERE productId= ?`;
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else res.json({data})
    })
});

app.get("/api/tutorials", (req, res) => {
  const q = "select * from tutorials";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.get("/api/tutorials/:tutorialId", (req, res) => {
  const id = req.params.tutorialId;
  const q = "SELECT * FROM tutorials where id=?";
  db.query(q, [id], (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.get("/api/tutorials/title/:tutorialTitle", (req, res) => {
  const id = req.params.tutorialTitle;
  const q = "SELECT * FROM tutorials where title=?";
  db.query(q, [id], (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.put("/api/tutorials/:tutorialId", (req, res) => {
  const id = req.params.tutorialId;
  console.log(id);
  console.log("updated " + req.body);
  const data = req.body;
  if (data.id) data.id = Number.parseInt(data.id);
  const q = "update tutorials set " +Object.keys(data).map((k) => `${k} = ?`).join(",") +" where id='" +id +"'";
  console.log(q);
  db.query(q, [...Object.values(data)], (err, out) => {
    console.log(err, out);
    if (err) return res.json({ error: err.message });
    else {
      return res.json({ data: out });
    }
  });
  /* const q = "select * from tutorials";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  }); */
});

app.put("/api/tutorials/status/:tutorialId", (req, res) => {
  const id = req.params.tutorialId;
  console.log(id);
  console.log("updated " + req.body);
  const data = req.body;
  if (data.id) data.id = Number.parseInt(data.id);
  const q = "update tutorials set " +Object.keys(data).map((k) => `${k} = ?`).join(",") +" where id='" +id +"'";
  console.log(q);
  db.query(q, [...Object.values(data)], (err, out) => {
    console.log(err, out);
    if (err) return res.json({ error: err.message });
    else {
      return res.json({ data: out });
    }
  });
  /* const q = "select * from tutorials";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  }); */
});

app.post("/api/tutorials", (req, res) => {
  const q = `insert into tutorials(id, title, description, published, category) values(?)`;
  const values = [...Object.values(req.body)];
  console.log("insert", values);
  db.query(q, [values], (err, data) => {
  console.log(err, data);
  if (err) return res.json({ error: err.sqlMessage });
  else return res.json({ data });
});


  /* const id = req.params.tutorialId;
  const q = "SELECT * FROM tutorials where id=?";
  db.query(q, [id], (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  }); */
});

app.delete("/api/tutorials", (req, res) => {
  const q = "delete from tutorials";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.delete("/api/tutorials/:tutorialId", (req, res) => {
  const id = req.params.tutorialId;
    console.log("deleting " + id, req.body);
    console.log(req.body);
    const q = `DELETE FROM tutorials WHERE id= ?`;
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else res.json({data})
    })
});



/* Account Plus starts from here....*/
/* OBMaster Master from here....*/
app.get("/api/obmaster", (req, res) => {
  const q = "select * from obmaster_master";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.get("/api/obmaster/:obmaster_id", (req, res) => {
  const id = req.params.obmaster_id;
  const q = "SELECT * FROM obmaster_master where id=?";
  db.query(q, [id], (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.get("/api/obmaster/title/:obmaster_id", (req, res) => {
  const id = req.params.obmaster_id;
  const q = "SELECT * FROM obmaster_master where title=?";
  db.query(q, [id], (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.put("/api/obmaster/:obmaster_id", (req, res) => {
  const id = req.params.obmaster_id;
  console.log(id);
  console.log("updated " + req.body);
  const data = req.body;
  if (data.id) data.id = Number.parseInt(data.id);
  const q = "update obmaster_master set " +Object.keys(data).map((k) => `${k} = ?`).join(",") +" where obmaster_id='" +id +"'";
  console.log(q);
  db.query(q, [...Object.values(data)], (err, out) => {
    console.log(err, out);
    if (err) return res.json({ error: err.message });
    else {
      return res.json({ data: out });
    }
  });
});

app.put("/api/obmaster/status/:obmaster_id", (req, res) => {
  const id = req.params.obmaster_id;
  console.log(id);
  console.log("updated " + req.body);
  const data = req.body;
  if (data.id) data.id = Number.parseInt(data.id);
  const q = "update obmaster_master set " +Object.keys(data).map((k) => `${k} = ?`).join(",") +" where id='" +id +"'";
  console.log(q);
  db.query(q, [...Object.values(data)], (err, out) => {
    console.log(err, out);
    if (err) return res.json({ error: err.message });
    else {
      return res.json({ data: out });
    }
  });
});

app.post("/api/obmaster", (req, res) => {
  const q = `insert into obmaster_master(scheme_id, scheme_name, budget_id, budget_name, acc_id, acc_name, vch_desc, amt_rec, amt_pay, vch_date) values(?)`;
  const values = [...Object.values(req.body)];
  console.log("insert", values);
  db.query(q, [values], (err, data) => {
  console.log(err, data);
  if (err) return res.json({ error: err.sqlMessage });
  else return res.json({ data });
});
});

app.delete("/api/obmaster", (req, res) => {
  const q = "delete from obmaster_master";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.delete("/api/obmaster/:obmaster_id", (req, res) => {
  const id = req.params.obmaster_id;
    console.log("deleting " + id, req.body);
    console.log(req.body);
    const q = `DELETE FROM obmaster_master WHERE obmaster_id= ?`;
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else res.json({data})
    })
});

app.get("/api/schemes", (req, res) => {
  const q = "select * from scheme_master";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});


/* Outward Voucher Entry from here....*/
app.get("/api/outward", (req, res) => {
  const q = "select * from outward_vchentry";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.get("/api/outward/:outward_id", (req, res) => {
  const id = req.params.outward_id;
  const q = "SELECT * FROM outward_vchentry where outward_id=?";
  db.query(q, [id], (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.get("/api/outward/title/:outward_id", (req, res) => {
  const id = req.params.outward_id;
  const q = "SELECT * FROM outward_vchentry where title=?";
  db.query(q, [id], (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.put("/api/outward/:outward_id", (req, res) => {
  const id = req.params.outward_id;
  console.log(id);
  console.log("updated " + req.body);
  const data = req.body;
  if (data.id) data.id = Number.parseInt(data.id);
  const q = "update outward_vchentry set " +Object.keys(data).map((k) => `${k} = ?`).join(",") +" where outward_id='" +id +"'";
  console.log(q);
  db.query(q, [...Object.values(data)], (err, out) => {
    console.log(err, out);
    if (err) return res.json({ error: err.message });
    else {
      return res.json({ data: out });
    }
  });
});

app.put("/api/outward/status/:outward_id", (req, res) => {
  const id = req.params.outward_id;
  console.log(id);
  console.log("updated " + req.body);
  const data = req.body;
  if (data.id) data.id = Number.parseInt(data.id);
  const q = "update outward_vchentry set " +Object.keys(data).map((k) => `${k} = ?`).join(",") +" where outward_id='" +id +"'";
  console.log(q);
  db.query(q, [...Object.values(data)], (err, out) => {
    console.log(err, out);
    if (err) return res.json({ error: err.message });
    else {
      return res.json({ data: out });
    }
  });
});

app.post("/api/outward", (req, res) => {
  const q = `insert into outward_vchentry(scheme_name, vch_type, chq_no, chq_date, bank_name, vch_desc, amt_rec, amt_pay, vch_date) values(?)`;
  const values = [...Object.values(req.body)];
  console.log("insert", values);
  db.query(q, [values], (err, data) => {
  console.log(err, data);
  if (err) return res.json({ error: err.sqlMessage });
  else return res.json({ data });
});
});

app.delete("/api/outward", (req, res) => {
  const q = "delete from outward_vchentry";
  db.query(q, (err, data) => {
    console.log(err, data);
    if (err) return res.json({ error: err.sqlMessage });
    else return res.json({ data });
  });
});

app.delete("/api/outward/:outward_id", (req, res) => {
  const id = req.params.outward_id;
    console.log("deleting " + id, req.body);
    console.log(req.body);
    const q = `DELETE FROM outward_vchentry WHERE outward_id= ?`;
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else res.json({data})
    })
});