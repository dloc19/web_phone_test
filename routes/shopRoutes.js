const express = require("express")
const shopRouter = express.Router()
const shopController = require("../controllers/shopController");
const con = require("../database/connection");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const { check, validationResult, body } = require('express-validator');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redirectindex = (req, res, next) => {
  if (!req.session.loggedID) {
    res.redirect("/login");
  } else {
    next();
  }
};
const adminredirectindex = (req, res, next) => {
  if (!req.session.loggedID) {
    res.redirect("/admin");
  } else {
    next();
  }
};
shopRouter.get("/", async (req, res) => {
  res.redirect("/login");
});
//THANK YOU PAGE
shopRouter.get("/thankyou", redirectindex, async (req, res) => {
  res.render("thankyou");
});
//PROFILE PAGE
shopRouter.get("/profile", redirectindex, shopController.profilePage);
shopRouter.post("/profile", shopController.updateProfilePage);
//ORDERS PAGE
shopRouter.get("/orders", redirectindex, shopController.ordersPage);
//SHOP PAGE
shopRouter.get("/shop", redirectindex, shopController.shopPage);
shopRouter.post("/shop", shopController.addToCart);
//PRODUCTS PAGE
shopRouter.get("/products", redirectindex, shopController.productsPage);
shopRouter.post("/products", shopController.productAllFunction);
//CARTS PAGE
shopRouter.get('/cart', redirectindex, shopController.viewCart);
shopRouter.post('/cart', shopController.removeOrUpdateCart);
//CHECKOUT PAGE
shopRouter.post("/checkout", shopController.checkout);
//REGISTER PAGE
shopRouter.get("/register", async (req, res) => {
  res.render("register");
});
//REGISTRATION CHECK
shopRouter.post("/register", shopController.userinsert);

//LOGIN PAGE
shopRouter.get('/login', async (req, res) => {
  res.render("login");
});

//CHECK LOGIN
shopRouter.post("/login", shopController.checkLogin);
//LOGOUT
shopRouter.get("/logout", shopController.logout);

//----ADMIN ROUTES------//
//ERROR PAGE
shopRouter.get('/admin/error', async (req, res) => {
  res.render("admin/errorPage");
});
//PRODUCTS
shopRouter.get('/admin/addProduct', adminredirectindex, async (req, res) => {
  con.query("SELECT * FROM categories", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.render("admin/addProduct", { result: result, product_active: "active" });
    }
  });
});
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    var dir = "./public/uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
var maxSize = 5242880;
var upload = multer({ storage: storage, limits: { fileSize: maxSize } });
//ADD PRODUCTS
shopRouter.post('/admin/addProduct', upload.single('prod_img'), (req, res) => {
  if (!req.file) {
    console.log("No uploaded files");
  }
  else {
    let image_path = req.file.filename;
    let prod_name = req.body.prod_name;
    let prod_qty = req.body.prod_qty;
    let prod_price = req.body.prod_price;
    let prod_cat = req.body.prod_cat;
    let prod_stat = 0;
    const sql = `INSERT INTO products VALUES (NULL,?,?,?,?,?,?)`;
    con.query(sql, [image_path, prod_name, prod_qty, prod_price, prod_cat, prod_stat], function (err, result) {
      if (err) throw err;
      con.query("SELECT * FROM categories", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/addProduct", { result: result, alert: "Product successfully added.", product_active: "active" });
        }
      });
    });
  }
});
//MANAGE PRODUCTS
shopRouter.get('/admin/manageProduct', adminredirectindex, async (req, res) => {
  con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      con.query("SELECT * FROM categories", function (err, cresult) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/manageProduct", { result: result, cresult: cresult, product_active: "active" });
        }
      });
    }
    else {
      res.render("admin/manageProduct", { noresult: "No products added yet.", product_active: "active" });
    }
  });
});

shopRouter.post('/admin/manageProduct', upload.single('prod_img'), (req, res) => {
  if (req.body.update) {
    if (!req.file) {
      let prod_name = req.body.prod_name;
      let prod_id = req.body.prod_id;
      let prod_qty = req.body.prod_qty;
      let prod_price = req.body.prod_price;
      let prod_cat = req.body.prod_cat;
      let prod_stat = 0;
      con.query("UPDATE products SET prod_name=?,prod_qty=?,prod_price=?,prod_cat=?,prod_stat=? WHERE prod_id=?",
        [prod_name, prod_qty, prod_price, prod_cat, prod_stat, prod_id], function (err, result) {
          if (err) throw err;
          con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              con.query("SELECT * FROM categories", function (err, cresult) {
                if (err) throw err;
                if (result.length > 0) {
                  res.render("admin/manageProduct", { alert: "Product updated succesfully.", result: result, cresult: cresult, product_active: "active" });
                }
              });
            }
          });
        });
    }
    else {
      let image_path = req.file.filename;
      let prod_name = req.body.prod_name;
      let prod_id = req.body.prod_id;
      let prod_qty = req.body.prod_qty;
      let prod_price = req.body.prod_price;
      let prod_cat = req.body.prod_cat;
      let prod_stat = 0;
      con.query("UPDATE products SET prod_img=?,prod_name=?,prod_qty=?,prod_price=?,prod_cat=?,prod_stat=? WHERE prod_id=?",
        [image_path, prod_name, prod_qty, prod_price, prod_cat, prod_stat, prod_id], function (err, result) {
          if (err) throw err;
          con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              con.query("SELECT * FROM categories", function (err, cresult) {
                if (err) throw err;
                if (result.length > 0) {
                  res.render("admin/manageProduct", { alert: "Product updated succesfully.", result: result, cresult: cresult, product_active: "active" });
                }
              });
            }
          });
        });
    }
  }
  else if (req.body.search) {
    let search_input = req.body.search_input;
    con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id WHERE products.prod_name LIKE '%" + search_input + "%'", function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        con.query("SELECT * FROM categories", function (err, cresult) {
          if (err) throw err;
          if (result.length > 0) {
            res.render("admin/manageProduct", { result: result, cresult: cresult, product_active: "active" });
          }
        });
      }
      else {
        res.render("admin/manageProduct", { searchalert: search_input, product_active: "active" });
      }
    });
  }
  else if(req.body.remove) {
    const prod_id = req.body.prod_id;
    con.query("DELETE FROM products WHERE prod_id=?", [prod_id], function (err, result) {
      if (err) throw err;
      con.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/manageProduct", { result: result, alertDelete: "Product Deleted Successfully.", product_active: "active" });
        } else {
          res.render("admin/manageProduct", { result: result, alertDelete: "Product Deleted Successfully.", product_active: "active" });
        }
      });
    });
  }

  else {
    let prod_id = req.body.prod_id;
    con.query(
      "SELECT * FROM featured WHERE prod_id=?", [prod_id],
      function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              con.query("SELECT * FROM categories", function (err, cresult) {
                if (err) throw err;
                if (result.length > 0) {
                  res.render("admin/manageProduct", { alert: "Product already added to featured products.", result: result, cresult: cresult, product_active: "active" });
                }
              });
            }
          });
        }
        else {
          const sql = `INSERT INTO featured VALUES (NULL,?)`;
          con.query(sql, [prod_id], function (err, result) {
            if (err) throw err;
            con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
              if (err) throw err;
              if (result.length > 0) {
                con.query("SELECT * FROM categories", function (err, cresult) {
                  if (err) throw err;
                  if (result.length > 0) {
                    res.render("admin/manageProduct", { alert: "Product succesfully added to featured products.", result: result, cresult: cresult, product_active: "active" });
                  }
                });
              }
            });
          });
        }
      });
  }
});
//FEAUTRED PRODUCTS
shopRouter.get('/admin/featuredProduct', adminredirectindex, async (req, res) => {
  con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id INNER JOIN featured ON products.prod_id = featured.prod_id", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      con.query("SELECT * FROM categories", function (err, cresult) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/featuredProduct", { result: result, cresult: cresult, product_active: "active" });
        }
      });
    }
    else {
      res.render("admin/featuredProduct", { noresult: "No featured products added yet.", product_active: "active" });
    }
  });
});
shopRouter.post('/admin/featuredProduct', shopController.removeFeaturedProduct);
//CATEGORIES
shopRouter.get('/admin/addCategory', adminredirectindex, async (req, res) => {
  res.render("admin/addCategory", { cat_active: "active" });
});
shopRouter.post('/admin/addCategory', shopController.addCategory);
shopRouter.get('/admin/manageCategory', adminredirectindex, shopController.manageCategory);
shopRouter.post('/admin/manageCategory', shopController.UpdateOrDeleteCategory);
//USERS
shopRouter.get('/admin/manageUsers', adminredirectindex, async (req, res) => {
  con.query("SELECT * FROM users", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.render("admin/manageUsers", { result: result, users_active: "active" });
    }
  });
});
shopRouter.post('/admin/manageUsers', shopController.deactivateUser);
//ORDERS
shopRouter.get('/admin/manageOrders', adminredirectindex, shopController.manageOrders);
shopRouter.post('/admin/manageOrders', adminredirectindex, shopController.approveCancelOrder);
//ADMIN LOGIN PAGE
shopRouter.get('/admin', async (req, res) => {
  res.render("adminLogin");
});
//ADMIN CHECK LOGIN
shopRouter.post("/admin", shopController.checkAdminLogin);
//ADMIN LOGOUT
shopRouter.get("/adminLogout", shopController.adminLogout);
//ADMIN HOME PAGE
shopRouter.get('/admin/home', adminredirectindex, async (req, res) => {
  con.query("SELECT COUNT(id) as total_uid FROM users", function (err, uresult) {
    if (err) throw err;
    con.query("SELECT COUNT(cat_id) as total_cid FROM categories", function (err, cresult) {
      if (err) throw err;
      con.query("SELECT COUNT(prod_id) as total_pid FROM products", function (err, presult) {
        if (err) throw err;
        con.query("SELECT COUNT(order_id) as total_oid FROM orders", function (err, oresult) {
          if (err) throw err;
          res.render("admin/adminHome", { uresult: uresult, oresult: oresult, cresult: cresult, presult: presult, home_active: "active" });
        });
      });
    });
  });
});
//ACCOUNT
shopRouter.get('/admin/account', adminredirectindex, async (req, res) => {
  con.query("SELECT * FROM admin", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.render("admin/adminAccount", { result: result });
    }
  });
});
shopRouter.post('/admin/account', adminredirectindex, shopController.changePassword);
module.exports = shopRouter