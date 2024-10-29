const con = require("../database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
var moment = require('moment');

//API
//ADMIN
exports.AdminLogin = (req, res) => {
  let username = req.body.uname;
  let password = req.body.pwd;

  con.query(
    "SELECT * FROM admin WHERE admin_email=?",
    [username],
    function (err, result) {
      if (err) throw err;

      if (result.length > 0) {
        // So sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong database
        bcrypt.compare(password, result[0].admin_pwd, function (err, isMatch) {
          if (err) throw err;

          if (isMatch) {
            req.session.username = result[0].admin_name;
            req.session.loggedID = result[0].admin_id;
            
            // Trả về thông tin admin dưới dạng JSON
            res.status(200).json({
              message: "Login successful",
              admin: {
                id: result[0].admin_id,
                name: result[0].admin_name,
                email: result[0].admin_email,
                password: result[0].admin_pwd
              }
            });
          } else {
            res.status(401).json({ message: "Invalid password" });
          }
        });
      } else {
        res.status(401).json({ message: "Invalid email" });
      }
    }
  );
};

exports.ordersProduct = (req, res) => {
  con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id ORDER BY orders.order_id DESC", function (err, allresult) {
    if (err) throw err;
    if (allresult.length > 0) {
      con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=0 ORDER BY orders.order_id DESC", function (err, penResult) {
        if (err) throw err;
        con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=1 ORDER BY orders.order_id DESC", function (err, accResult) {
          if (err) throw err;
          con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=2 ORDER BY orders.order_id DESC", function (err, canResult) {
            if (err) throw err;
            res.json({
              order_active: "active",
              allresult: allresult,
              penResult: penResult,
              accResult: accResult,
              canResult: canResult,
              moment: moment // Nếu không cần `moment` cho dữ liệu JSON, bạn có thể bỏ qua phần này.
            });
          });
        });
      });
    } else {
      res.json({ order_active: "active", fixed: "fixed-bottom" });
    }
  });
};

exports.manageCancelledOrders = (req, res) => {
  con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat = 2 ORDER BY orders.order_id DESC", function (err, canResult) {
    if (err) throw err;
    res.json({
      order_active: "active",
      canResult: canResult
    });
  });
};

exports.manageAcceptedOrders = (req, res) => {
  con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat = 1 ORDER BY orders.order_id DESC", function (err, accResult) {
    if (err) throw err;
    res.json({
      order_active: "active",
      accResult: accResult
    });
  });
};

exports.managePendingOrders = (req, res) => {
  con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat = 0 ORDER BY orders.order_id DESC", function (err, penResult) {
    if (err) throw err;
    res.json({
      order_active: "active",
      penResult: penResult
    });
  });
};

exports.getUsers = (req, res) => {
  con.query("SELECT * FROM users", function (err, result) {
    if (err) {
      res.status(500).json({ error: "Có lỗi xảy ra khi truy vấn dữ liệu." });
      throw err;
    }

    // Phân loại người dùng thành active và deactive
    const activateUsers = result.filter(user => user.account_stat === 0); // Trạng thái tài khoản là active (1)
    const deactivateUsers = result.filter(user => user.account_stat === 1); // Trạng thái tài khoản là deactive (0)

    res.json({
      users_active: "active",
      activate: activateUsers,
      deactivate: deactivateUsers
    });
  });
};

//USER
exports.userRegistor = (req, res) => {
  const fullname = req.body.fullname;
  const addr = req.body.addr;
  const username = req.body.uname;
  const pass = req.body.pwd;
  const password_confirm = req.body.password_confirm;

  if (fullname == null) {
    res.json({ error: "Fullname is required." });
  } else if (pass !== password_confirm) {
    res.json({ error: "Password didn't match." });
  } else {
    con.query("SELECT * FROM users WHERE username=?", [username], function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.json({ error: "Email Address already exists." });
      } else {
        bcrypt.hash(pass, saltRounds, function (err, hash) {
          if (err) throw err;

          // Store the user in the database
          const sql = `INSERT INTO users VALUES (NULL,?,?,?,0,?)`;
          con.query(sql, [username, hash, fullname, addr], function (err, result) {
            if (err) throw err;

            // Return user data as JSON after successful registration
            res.json({
              message: "User registered successfully.",
              user: {
                id: result.insertId,
                username: username,
                fullname: fullname,
                address: addr
              }
            });
          });
        });
      }
    });
  }
};

exports.getOrdersByUserId = (req, res) => {
  const userId = req.params.userId;

  // Kiểm tra xem user_id có tồn tại hay không
  con.query("SELECT * FROM users WHERE id = ?", [userId], function (err, userResult) {
    if (err) {
      res.status(500).json({ error: "Có lỗi xảy ra khi truy vấn dữ liệu người dùng." });
      throw err;
    }

    // Nếu không tìm thấy user
    if (userResult.length === 0) {
      return res.status(500).json({ error: "Người dùng không tồn tại." });
    }

    // Nếu user tồn tại, tiếp tục truy vấn các đơn hàng
    con.query(
      "SELECT orders.order_id, orders.prod_id as opid, orders.ord_stat, products.* FROM orders INNER JOIN products ON orders.prod_id = products.prod_id WHERE orders.user_id = ? ORDER BY orders.order_id DESC",
      [userId],
      function (err, userOrders) {
        if (err) {
          res.status(500).json({ error: "Có lỗi xảy ra khi truy vấn dữ liệu đơn hàng." });
          throw err;
        }

        // Phân loại các đơn hàng dựa trên trạng thái
        const approved = userOrders.filter(order => order.ord_stat === 1);
        const pending = userOrders.filter(order => order.ord_stat === 0);
        const cancelled = userOrders.filter(order => order.ord_stat === 2);

        res.json({
          user_id: userId,
          approved: approved,
          pending: pending,
          cancelled: cancelled
        });
      }
    );
  });
};

//PRODUCT
exports.getProductById = (req, res) => {
  const productId = req.params.id;  // Lấy id sản phẩm từ URL

  // Truy vấn lấy sản phẩm dựa trên productId
  con.query(
    "SELECT prod_id, prod_img, prod_name, prod_qty, prod_price, prod_cat, prod_stat FROM products WHERE prod_id = ?",
    [productId],
    function (err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      }

      // Kiểm tra nếu tìm thấy sản phẩm
      if (result.length > 0) {
        res.json({
          product: result[0]  // Trả về sản phẩm đầu tiên (chỉ có một sản phẩm với id)
        });
      } else {
        res.status(404).json({
          message: "Product not found."
        });
      }
    }
  );
};

exports.updateProduct = (req, res) => {
  const productId = req.params.id;  // Lấy id sản phẩm từ URL
  const { prod_img, prod_name, prod_qty, prod_price, prod_cat, prod_stat } = req.body;  // Lấy dữ liệu từ body

  // Tạo mảng để lưu các trường cần cập nhật và giá trị tương ứng
  const updates = [];
  const values = [];

  // Kiểm tra từng trường và chỉ thêm nếu có giá trị mới
  if (prod_img !== undefined) {
    updates.push("prod_img = ?");
    values.push(prod_img);
  }
  if (prod_name !== undefined) {
    updates.push("prod_name = ?");
    values.push(prod_name);
  }
  if (prod_qty !== undefined) {
    updates.push("prod_qty = ?");
    values.push(prod_qty);
  }
  if (prod_price !== undefined) {
    updates.push("prod_price = ?");
    values.push(prod_price);
  }
  if (prod_cat !== undefined) {
    updates.push("prod_cat = ?");
    values.push(prod_cat);
  }
  if (prod_stat !== undefined) {
    updates.push("prod_stat = ?");
    values.push(prod_stat);
  }

  // Kiểm tra xem có trường nào cần cập nhật không
  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields to update." });
  }

  // Tạo câu truy vấn SQL
  const sql = `UPDATE products SET ${updates.join(", ")} WHERE prod_id = ?`;
  values.push(productId);  // Thêm productId vào cuối mảng giá trị

  // Thực hiện truy vấn
  con.query(sql, values, function (err, result) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (result.affectedRows > 0) {
      res.json({
        message: "Product updated successfully."
      });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  });
};

exports.deleteProduct = (req, res) => {
  const productId = req.params.id;  // Lấy id sản phẩm từ URL

  // Truy vấn để xóa sản phẩm
  con.query("DELETE FROM products WHERE prod_id = ?", [productId], function (err, result) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (result.affectedRows > 0) {
      res.json({
        message: "Product deleted successfully."
      });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  });
};

exports.getAllProducts = (req, res) => {
  // Truy vấn để lấy tất cả sản phẩm
  con.query("SELECT prod_id, prod_img, prod_name, prod_qty, prod_price, prod_cat, prod_stat FROM products", function (err, result) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Kiểm tra nếu không có sản phẩm nào
    if (result.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    // Trả về danh sách sản phẩm
    res.json({
      products: result
    });
  });
};


//SHOP PAGE CUSTOMER
exports.shopPage = (req, res) => {
  let loggedID = req.session.loggedID;
  con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id INNER JOIN featured ON products.prod_id = featured.prod_id", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
        if (err) throw err;
        res.render("shop", { result: result, cresult: cresult });
      });
    }
    else {
      res.render("shop", { noresult: "No featured products to display.", fixed: "fixed-bottom" });
    }
  });
};
exports.addToCart = (req, res) => {
  const loggedID = req.session.loggedID;
  const prod_id = req.body.prod_id;
  const prod_qty = req.body.prod_qty;
  con.query("SELECT * FROM carts WHERE prod_id=? AND user_id=?", [prod_id, loggedID], function (err, checkresult) {
    if (err) throw err;
    if (checkresult.length > 0) {
      con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id INNER JOIN featured ON products.prod_id = featured.prod_id", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
            if (err) throw err;
            res.render("shop", { result: result, cresult: cresult, cartAlert: "Product already added to cart." });
          });
        }
        else {
          res.render("shop", { noresult: "No featured products to display.", fixed: "fixed-bottom", cartAlert: "Product already added to cart." });
        }
      });
    } else {
      const sql = `INSERT INTO carts VALUES (NULL,?,?,?)`;
      con.query(sql, [loggedID, prod_id, prod_qty], function (err, result) {
        if (err) throw err;
        con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id INNER JOIN featured ON products.prod_id = featured.prod_id", function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              res.render("shop", { result: result, cresult: cresult, alert: "Product added to cart." });
            });
          }
          else {
            res.render("shop", { noresult: "No featured products to display.", fixed: "fixed-bottom", alert: "Product added to cart." });
          }
        });
      });
    }
  });
};
//PROFILE PAGE CUSTOMER
exports.profilePage = (req, res) => {
  const loggedID = req.session.loggedID;
  con.query("SELECT * FROM users WHERE id =?", [loggedID], function (err, result) {
    if (err) throw err;
    con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
      if (err) throw err;
      res.render("account", { result: result, cresult: cresult });
    });
  });
}
exports.updateProfilePage = (req, res) => {
  const loggedID = req.session.loggedID;

  if (req.body.user_id && req.body.cur_pwd) {
    let cur_pwd = req.body.cur_pwd;
    let new_pwd = req.body.new_pwd;
    let con_new_pwd = req.body.con_new_pwd;
    let user_id = req.body.user_id;

    con.query("SELECT * FROM users WHERE id=?", [user_id], function (err, result) {
      if (err) throw err;

      if (result.length > 0) {
        if (bcrypt.compareSync(cur_pwd, result[0].password)) {
          // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
          if (new_pwd === cur_pwd) {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              res.status(401).render("account", {
                alert: "New password must not be the same as the current password.",
                result: result,
                cresult: cresult
              });
            });
          } else if (new_pwd.length < 6) {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              res.status(401).render("account", {
                alert: "New password must be at least 6 characters long.",
                result: result,
                cresult: cresult
              });
            });
          } else if (new_pwd !== con_new_pwd) {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              res.status(401).render("account", {
                alert: "New password and confirm new password don't match.",
                result: result,
                cresult: cresult
              });
            });
          } else {
            bcrypt.hash(new_pwd, saltRounds, function (err, hash) {
              const sql = `UPDATE users SET password=? WHERE id=?`;
              con.query(sql, [hash, user_id], function (err, uresult) {
                if (err) throw err;
                con.query("SELECT * FROM users WHERE id=?", [user_id], function (err, result) {
                  con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
                    if (err) throw err;
                    res.render("account", { alertSuccess: "Password successfully changed.", result: result, cresult: cresult });
                  });
                });
              });
            });
          }
        } else {
          con.query("SELECT * FROM users WHERE id=?", [user_id], function (err, result) {
            if (err) throw err;
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              res.status(401).render("account", { alert: "Incorrect current password.", result: result, cresult: cresult });
            });
          });
        }
      }
    });
  } else if (req.body.user_id && req.body.new_addr) {
    let new_addr = req.body.new_addr;
    let user_id = req.body.user_id;
    const sql = `UPDATE users SET addr=? WHERE id=?`;
    con.query(sql, [new_addr, user_id], function (err, result) {
      if (err) throw err;
      con.query("SELECT * FROM users WHERE id=?", [user_id], function (err, result) {
        con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
          if (err) throw err;
          res.render("account", { alertSuccess: "Address successfully changed.", result: result, cresult: cresult });
        });
      });
    });
  }
};
//PRODUCTS PAGE CUSTOMER
exports.productsPage = (req, res) => {
  let loggedID = req.session.loggedID;
  con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
        if (err) throw err;
        con.query("SELECT * FROM categories", function (err, catresult) {
          if (err) throw err;
          con.query("SELECT * FROM featured", function (err, fresult) {
            if (err) throw err;
            if (fresult.length > 0) {
              res.render("products", { result: result, cresult: cresult, catresult: catresult, fresult: fresult });
            } else {
              res.render("products", { result: result, cresult: cresult, catresult: catresult });
            }
          });
        });
      });
    }
    else {
      res.render("products", { noresult: "No products to display.", fixed: "fixed-bottom" });
    }
  });
};

exports.productAllFunction = (req, res) => {
  if (req.body.prod_cat) {

    let loggedID = req.session.loggedID;
    let prod_cat = req.body.prod_cat;
    if (req.body.prod_cat == 0) {
      con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
            if (err) throw err;
            con.query("SELECT * FROM categories", function (err, catresult) {
              if (err) throw err;
              con.query("SELECT * FROM featured", function (err, fresult) {
                if (err) throw err;
                if (fresult.length > 0) {
                  res.render("products", { result: result, cresult: cresult, catresult: catresult, fresult: fresult });
                } else {
                  res.render("products", { result: result, cresult: cresult, catresult: catresult });
                }
              });
            });
          });
        }
        else {
          res.render("products", { noresult: "No products to display.", fixed: "fixed-bottom" });
        }
      });
    } else {
      con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id WHERE prod_cat=?",
        [prod_cat], function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              con.query("SELECT * FROM categories WHERE cat_id=?", [prod_cat], function (err, catname) {
                if (err) throw err;
                con.query("SELECT * FROM categories", function (err, catresult) {
                  if (err) throw err;
                  res.render("products", { result: result, cresult: cresult, catresult: catresult, catSelected: prod_cat, catnameSuccess: catname });
                });
              });
            });
          }
          else {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              con.query("SELECT * FROM categories WHERE cat_id=?", [prod_cat], function (err, catname) {
                if (err) throw err;
                con.query("SELECT * FROM categories", function (err, catresult) {
                  if (err) throw err;
                  res.render("products", { catname: catname, fixed: "fixed-bottom", cresult: cresult, catresult: catresult, catSelected: prod_cat });
                });
              });
            });
          }
        });
    }

  }
  else if (req.body.search_input) {
    let loggedID = req.session.loggedID;
    let search_input = req.body.search_input;
    con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id WHERE prod_name LIKE '%" + search_input + "%'",
      function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
            if (err) throw err;
            con.query("SELECT * FROM categories", function (err, catresult) {
              if (err) throw err;
              res.render("products", { result: result, cresult: cresult, catresult: catresult, search: search_input });
            });
          });
        }
        else {
          con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
            if (err) throw err;
            con.query("SELECT * FROM categories", function (err, catresult) {
              if (err) throw err;
              res.render("products", { noresult: search_input, fixed: "fixed-bottom", result: result, cresult: cresult, catresult: catresult });
            });
          });
        }
      });
  } else {
    let loggedID = req.session.loggedID;
    const prod_id = req.body.prod_id;
    const prod_qty = req.body.prod_qty;
    con.query("SELECT * FROM carts WHERE prod_id=? AND user_id=?", [prod_id, loggedID], function (err, checkresult) {
      if (err) throw err;
      if (checkresult.length > 0) {
        con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              con.query("SELECT * FROM categories", function (err, catresult) {
                if (err) throw err;
                res.render("products", { result: result, cresult: cresult, catresult: catresult, cartAlert: "Product already added to cart." });
              });
            });
          }
          else {
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              con.query("SELECT * FROM categories", function (err, catresult) {
                if (err) throw err;
                res.render("products", { noresult: "No products to display.", fixed: "fixed-bottom", cresult: cresult, catresult: catresult, cartAlert: "Product already added to cart." });
              });
            });
          }
        });
      } else {
        const sql = `INSERT INTO carts VALUES (NULL,?,?,?)`;
        con.query(sql, [loggedID, prod_id, prod_qty], function (err, result) {
          if (err) throw err;
          con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
                if (err) throw err;
                con.query("SELECT * FROM categories", function (err, catresult) {
                  if (err) throw err;
                  res.render("products", { result: result, cresult: cresult, catresult: catresult, alert: "Product added to cart." });
                });
              });
            }
            else {
              con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
                if (err) throw err;
                con.query("SELECT * FROM categories", function (err, catresult) {
                  if (err) throw err;
                  res.render("products", { noresult: "No  products to display.", fixed: "fixed-bottom", cresult: cresult, catresult: catresult, alert: "Product added to cart." });
                });
              });
            }
          });
        });
      }
    });
  }
};
//CART CUSTOMER
exports.viewCart = (req, res) => {
  let loggedID = req.session.loggedID;
  con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
    if (err) throw err;
    if (cresult.length > 0) {
      con.query("SELECT *, products.prod_qty as pqty, carts.prod_qty as cqty, carts.prod_id as cpid FROM carts INNER JOIN products ON carts.prod_id = products.prod_id INNER JOIN categories ON products.prod_cat = categories.cat_id WHERE carts.user_id=?", [loggedID], function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("viewcart", { cresult: cresult, result: result });
        }
        else {
          res.render("viewcart", { cresult: cresult, fixed: "fixed-bottom" });
        }
      });
    } else {
      res.render("viewcart", { cresult: cresult, fixed: "fixed-bottom" });
    }
  });
};
exports.removeOrUpdateCart = (req, res) => {
  if (req.body.delete_cart_id) {
    let delete_cart_id = req.body.delete_cart_id;
    let loggedID = req.session.loggedID;
    con.query("DELETE FROM carts WHERE cart_id=? and user_id=?", [delete_cart_id, loggedID], function (err, removeResult) {
      if (err) throw err;
      con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
        if (err) throw err;
        if (cresult.length > 0) {
          con.query("SELECT *, products.prod_qty as pqty, carts.prod_qty as cqty, carts.prod_id as cpid FROM carts INNER JOIN products ON carts.prod_id = products.prod_id INNER JOIN categories ON products.prod_cat = categories.cat_id WHERE carts.user_id=?", [loggedID], function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              res.render("viewcart", { cresult: cresult, result: result, alert: "Product removed from cart." });
            }
            else {
              res.render("viewcart", { cresult: cresult, fixed: "fixed-bottom" });
            }
          });
        } else {
          res.render("viewcart", { cresult: cresult, fixed: "fixed-bottom", alert: "Product removed from cart." });
        }
      });
    });
  } else if (req.body.prod_qty && req.body.update_cart_id) {
    let prod_qty = req.body.prod_qty;
    let loggedID = req.session.loggedID;
    let update_cart_id = req.body.update_cart_id;
    con.query("UPDATE carts SET prod_qty=? WHERE cart_id=? and user_id=?", [prod_qty, update_cart_id, loggedID], function (err, removeResult) {
      if (err) throw err;
      con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
        if (err) throw err;
        if (cresult.length > 0) {
          con.query("SELECT *, products.prod_qty as pqty, carts.prod_qty as cqty, carts.prod_id as cpid FROM carts INNER JOIN products ON carts.prod_id = products.prod_id INNER JOIN categories ON products.prod_cat = categories.cat_id WHERE carts.user_id=?", [loggedID], function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              res.render("viewcart", { cresult: cresult, result: result, alertUpdate: "Product quantity updated." });
            }
            else {
              res.render("viewcart", { cresult: cresult, fixed: "fixed-bottom" });
            }
          });
        } else {
          res.render("viewcart", { cresult: cresult, fixed: "fixed-bottom", alertUpdate: "Product quantity updated." });
        }
      });
    });
  }
  else if (req.body.cart_id) {
    let loggedID = req.session.loggedID;
    let cart_id = req.body.cart_id;
    con.query("SELECT *,carts.prod_qty as cqty, carts.prod_id as pid FROM products INNER JOIN categories ON products.prod_cat=categories.cat_id INNER JOIN carts ON carts.prod_id = products.prod_id INNER JOIN users ON users.id = carts.user_id WHERE carts.cart_id=? AND carts.user_id=?",
      [cart_id, loggedID], function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
            if (err) throw err;
            res.render("checkout", { result: result, cresult: cresult });
          });
        }
        else {
          res.render("checkout", { noresult: "No products to display.", fixed: "fixed-bottom" });
        }
      });
  }
};
//CHECKOUT CUSTOMER
exports.checkout = (req, res) => {
  var todayDate = new Date().toISOString().slice(0, 10);
  const loggedID = req.session.loggedID;
  if (req.body.c_product_id && req.body.cart_id && req.body.ship_addr) {
    const c_product_id = req.body.c_product_id;
    const cart_id = req.body.cart_id;
    const qty = req.body.qty;
    const payment = req.body.payment;
    const ship_addr = req.body.ship_addr;
    const sql = `INSERT INTO orders VALUES (NULL,?,?,?,?,?,?,0)`;
    con.query(sql, [loggedID, c_product_id, qty, ship_addr, payment, todayDate], function (err, result) {
      if (err) throw err;
      con.query("DELETE FROM carts WHERE cart_id=? and user_id=?", [cart_id, loggedID], function (err, removeResult) {
        if (err) throw err;
        res.render("thankyou", { checkoutSuccess: "Yes" });
      });
    });
  }
}
//ORDERS CUSTOMER
exports.ordersPage = (req, res) => {
  let loggedID = req.session.loggedID;
  con.query("SELECT * FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE orders.user_id=? ORDER BY orders.order_id DESC", [loggedID], function (err, allresult) {
    if (err) throw err;
    if (allresult.length > 0) {
      con.query("SELECT * FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE orders.user_id=? AND ord_stat=0 ORDER BY orders.order_id DESC", [loggedID], function (err, penResult) {
        if (err) throw err;
        con.query("SELECT * FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE orders.user_id=? AND ord_stat=1 ORDER BY orders.order_id DESC", [loggedID], function (err, accResult) {
          if (err) throw err;
          con.query("SELECT * FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE orders.user_id=? AND ord_stat=2 ORDER BY orders.order_id DESC", [loggedID], function (err, canResult) {
            if (err) throw err;
            con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
              if (err) throw err;
              res.render("orders", { allresult: allresult, penResult: penResult, accResult: accResult, canResult: canResult, cresult: cresult, moment: moment });
            });
          });
        });
      });
    }
    else {
      con.query("SELECT COUNT(cart_id) as total_qty FROM carts WHERE user_id=?", [loggedID], function (err, cresult) {
        if (err) throw err;
        res.render("orders", { fixed: "fixed-bottom", cresult: cresult });
      });
    }
  });
};
//INSERT USER TO DB CUSTOMER
exports.userinsert = (req, res) => {
  const fullname = req.body.fullname;
  const username = req.body.uname;
  const pass = req.body.pwd;
  const password_confirm = req.body.password_confirm;
  const addr = req.body.addr;

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  if (!fullname || !username || !pass || !password_confirm || !addr) {
    res.status(401).render("register", {
      alertpass: "Please fill in this field",
    });
  } else if (!gmailRegex.test(username)){
    res.status(401).render("register", {
      alertpass: "Gmail is not in correct format",
    });
  } else if (pass != password_confirm) {
    res.status(401).render("register", {
      alertpass: "Password didn't matched",
    });
  } else if (pass.length < 6) {
    res.status(401).render("register", {
      alertpass: "Password must have at least 6 characters",
    });
  } else {
    con.query(
      "SELECT * FROM users WHERE username=?",
      [username],
      function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.status(401).render("register", {
            alertpass: "Email Address already exists",
          });
        } else {
          bcrypt.hash(pass, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            const sql = `INSERT INTO users VALUES (NULL,?,?,?,?,0)`;
            con.query(sql, [username, hash, fullname, addr], function (err, result) {
              if (err) throw err;
              res.redirect("/");
            });
          });
        }
      }
    );
  }
};
//LOGIN CHECK ADMIN
exports.checkAdminLogin = (req, res) => {
  let username = req.body.uname;
  let password = req.body.pwd;

  con.query(
    "SELECT * FROM admin WHERE admin_email=?",
    [username],
    function (err, result) {
      if (err) throw err;

      if (result.length > 0) {
        // So sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong database
        bcrypt.compare(password, result[0].admin_pwd, function (err, isMatch) {
          if (err) throw err;

          if (isMatch) {
            req.session.username = result[0].admin_name;
            req.session.loggedID = result[0].admin_id;
            
            res.redirect("/admin/home");
          } else {
            res.status(401).render("adminLogin", {
              alert: "Invalid password"
            });
          }
        });
      } else {
        res.status(401).render("adminLogin", { alert: "Invalid email" });
      }
    }
  );
};

//LOGIN CHECK CUSTOMER
exports.checkLogin = (req, res) => {
  let username = req.body.uname;
  let password = req.body.pwd;

  // Kiểm tra nếu username hoặc password bị bỏ trống
  if (!username || !password) {
    res.status(401).render("login", {
      alert: "Please enter full gmail and password",
    });
  } else {
    con.query(
      "SELECT * FROM users WHERE users.username=? AND account_stat = 0",
      [username],
      function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          if (bcrypt.compareSync(password, result[0].password)) {
            req.session.username = result[0].username;
            req.session.loggedID = result[0].id;

            res.redirect("/shop");
          } else {
            res.status(401).render("login", {
              alert: "Incorrect password",
            });
          }
        } else {
          con.query(
            "SELECT * FROM users INNER JOIN deacts ON users.id = deacts.user_id WHERE users.username=? ORDER BY d_id DESC LIMIT 1",
            [username], function (err, result) {
              if (err) throw err;
              res.status(401).render("login", { validation: result });
            });
        }
      }
    );
  }
};
//LOG-OUTS CUSTOMER
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};
//LOG-OUTS ADMIN
exports.adminLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
};
//CATEGORIES ADMIN
exports.addCategory = (req, res) => {
  const cat_name = req.body.cat_name;
  con.query(`SELECT * FROM categories WHERE cat_name=?`, [cat_name], function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.render("admin/addCategory", { error: "Category already exists." });
    }
    else {
      if (cat_name == null || cat_name == "") {
        res.render("admin/addCategory", { error: "Please fill-out the fields." });
      }
      else {
        const sql = `INSERT INTO categories VALUES (NULL,?)`;
        con.query(sql, [cat_name], function (err, result) {
          if (err) throw err;
          res.render("admin/addCategory", { alert: "Category added succesfully.", cat_active: "active" });
        });
      }
    }
  });

};
exports.manageCategory = (req, res) => {
  con.query("SELECT * FROM categories", function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.render("admin/manageCategory", { result: result, cat_active: "active" });
    } else {
      res.render("admin/manageCategory", { cat_active: "active" });
    }
  });
};
exports.UpdateOrDeleteCategory = (req, res) => {
  if (req.body.update) {
    const cat_name = req.body.cat_name;
    const cat_id = req.body.cat_id;
    con.query("UPDATE categories SET cat_name=? WHERE cat_id=?", [cat_name, cat_id], function (err, result) {
      if (err) throw err;
      con.query("SELECT * FROM categories", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/manageCategory", { result: result, alert: "Category updated successfully.", cat_active: "active" });
        } else {
          res.render("admin/manageCategory", { cat_active: "active" });
        }
      });
    });
  }
  else {
    const cat_id = req.body.cat_id;
    con.query("DELETE FROM categories WHERE cat_id=?", [cat_id], function (err, result) {
      if (err) throw err;
      con.query("SELECT * FROM categories", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/manageCategory", { result: result, alertDelete: "Category deleted successfully.", cat_active: "active" });
        } else {
          res.render("admin/manageCategory", { result: result, alertDelete: "Category deleted successfully.", cat_active: "active" });
        }
      });
    });
  }

};
//PRODUCTS ADMIN
exports.addProduct = (req, res) => {
  const prod_name = req.body.prod_name;
  const prod_qty = req.body.prod_qty;
  const prod_price = req.body.prod_price;
  const prod_cat = req.body.prod_cat;
  if (cat_name == null || cat_name == "") {
    res.render("admin/addCategory", { error: "Please fill-out the fields." });
  }
  else {
    const sql = `INSERT INTO categories VALUES (NULL,?)`;
    con.query(sql, [cat_name], function (err, result) {
      if (err) throw err;
      res.render("admin/addCategory", { alert: "Category added succesfully.", cat_active: "active" });
    });
  }
};
exports.removeFeaturedProduct = (req, res) => {
  if (req.body.search) {
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
  } else {

    let prod_id = req.body.prod_id;
    con.query("DELETE FROM featured WHERE prod_id=?", [prod_id], function (err, result) {
      if (err) throw err;;
      con.query("SELECT * FROM products INNER JOIN categories ON products.prod_cat = categories.cat_id INNER JOIN featured ON products.prod_id = featured.prod_id", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          con.query("SELECT * FROM categories", function (err, cresult) {
            if (err) throw err;
            if (result.length > 0) {
              res.render("admin/featuredProduct", { alert: "Product removed from featured products.", result: result, cresult: cresult, product_active: "active" });
            }
          });
        }
        else {
          res.render("admin/featuredProduct", { alert: "Product removed from featured products.", noresult: "No featured products added yet.", product_active: "active" });
        }
      });
    });
  }
};
//MANAGE USERS ADMIN
exports.deactivateUser = (req, res) => {
  if (req.body.deact) {
    let user_id = req.body.user_id;
    let deact_reason = req.body.deact_reason;
    if (deact_reason == null || deact_reason == "") {
      con.query("SELECT * FROM users", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/manageUsers", { error: " the reason field.", result: result, users_active: "active" });
        }
      });
    }
    else {
      const sql = `INSERT INTO deacts VALUES (NULL,?,?)`;
      con.query(sql, [user_id, deact_reason], function (err, result) {
        if (err) throw err;
        con.query("UPDATE users SET account_stat= 1 WHERE id=?", [user_id], function (err, result) {
          if (err) throw err;
          con.query("SELECT * FROM users", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              res.render("admin/manageUsers", { alert: "Account deactivated.", result: result, users_active: "active" });
            }
          });
        });
      });
    }
  } else {
    let user_id = req.body.user_id;
    con.query("UPDATE users SET account_stat= 0 WHERE id=?", [user_id], function (err, result) {
      if (err) throw err;
      con.query("SELECT * FROM users", function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.render("admin/manageUsers", { alert: "Account reactivated.", result: result, users_active: "active" });
        }
      });
    });
  }
};
//MANAGE ORDERS ADMIN
exports.manageOrders = (req, res) => {
  con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id ORDER BY orders.order_id DESC", function (err, allresult) {
    if (err) throw err;
    if (allresult.length > 0) {
      con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=0 ORDER BY orders.order_id DESC", function (err, penResult) {
        if (err) throw err;
        con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=1 ORDER BY orders.order_id DESC", function (err, accResult) {
          if (err) throw err;
          con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=2 ORDER BY orders.order_id DESC", function (err, canResult) {
            if (err) throw err;
            res.render("admin/manageOrders", { order_active: "active", allresult: allresult, penResult: penResult, accResult: accResult, canResult: canResult, moment: moment });
          });
        });
      });
    }
    else {
      res.render("admin/manageOrders", { order_active: "active", fixed: "fixed-bottom" });
    }
  });
};
exports.approveCancelOrder = (req, res) => {
  if (req.body.order_id && req.body.confirm_approve) {
    let order_id = req.body.order_id;
    let order_qty = req.body.order_qty;
    let order_prod_id = req.body.order_prod_id;
    con.query("UPDATE products SET prod_qty=prod_qty-? WHERE prod_id=?", [order_qty, order_prod_id], function (err, removeResult) {
      if (err) throw err;
      con.query("UPDATE orders SET ord_stat = 1 WHERE order_id=?", [order_id], function (err, result) {
        if (err) throw err;
        con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id ORDER BY orders.order_id DESC", function (err, allresult) {
          if (err) throw err;
          if (allresult.length > 0) {
            con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=0 ORDER BY orders.order_id DESC", function (err, penResult) {
              if (err) throw err;
              con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=1 ORDER BY orders.order_id DESC", function (err, accResult) {
                if (err) throw err;
                con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=2 ORDER BY orders.order_id DESC", function (err, canResult) {
                  if (err) throw err;
                  res.render("admin/manageOrders", { approve: "Order has been approved.", order_active: "active", allresult: allresult, penResult: penResult, accResult: accResult, canResult: canResult, moment: moment });
                });
              });
            });
          }
          else {
            res.render("admin/manageOrders", { approve: "Order has been approved.", order_active: "active", fixed: "fixed-bottom", moment: moment });
          }
        });
      });
    });
  } else if (req.body.c_order_id && req.body.confirm_cancel) {
    const order_id = req.body.c_order_id;
    con.query("UPDATE orders SET ord_stat = 2 WHERE order_id=?", [order_id], function (err, result) {
      if (err) throw err;
      con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id ORDER BY orders.order_id DESC", function (err, allresult) {
        if (err) throw err;
        if (allresult.length > 0) {
          con.query("SELECT *, orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=0 ORDER BY orders.order_id DESC", function (err, penResult) {
            if (err) throw err;
            con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=1 ORDER BY orders.order_id DESC", function (err, accResult) {
              if (err) throw err;
              con.query("SELECT *,orders.prod_id as opid FROM orders INNER JOIN products ON orders.prod_id = products.prod_id INNER JOIN users ON orders.user_id = users.id WHERE ord_stat=2 ORDER BY orders.order_id DESC", function (err, canResult) {
                if (err) throw err;
                res.render("admin/manageOrders", { approve: "Order has been cancelled.", order_active: "active", allresult: allresult, penResult: penResult, accResult: accResult, canResult: canResult, moment: moment });
              });
            });
          });
        }
        else {
          res.render("admin/manageOrders", { approve: "Order has been cancelled.", order_active: "active", fixed: "fixed-bottom", moment: moment });
        }
      });
    });
  }
};
//MANAGE PROFILE ADMIN
exports.changePassword = (req, res) => {
  let cur_pwd = req.body.cur_pwd;
  let new_pwd = req.body.new_pwd;
  let con_new_pwd = req.body.con_new_pwd;
  let admin_id = req.body.admin_id;
  con.query("SELECT * FROM admin", function (err, result) {
    if (err) throw err;
    // console.log(result);
    if (result.length > 0) {
      if (bcrypt.compareSync(cur_pwd, result[0].admin_pwd)) {
        if (new_pwd != con_new_pwd) {
          con.query("SELECT * FROM admin", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              res.render("admin/adminAccount", { alert: "New password and confirm new password doesn't match.", result: result });
            }
          });
        }
        else {
          bcrypt.hash(new_pwd, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            const sql = `UPDATE admin SET admin_pwd=? WHERE admin_id=?`;
            con.query(sql, [hash, admin_id], function (err, result) {
              if (err) throw err;
              con.query("SELECT * FROM admin", function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                  res.render("admin/adminAccount", { alertSuccess: "Password succesfully changed.", result: result });
                }
              });
            });
          });
        }
      } else {
        con.query("SELECT * FROM admin", function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            res.render("admin/adminAccount", { alert: "Incorrect current password.", result: result });
          }
        });
      }
    }
  }
  );
};