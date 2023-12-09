const express = require("express");
const app = express();
const { pool } = require("./dbCofig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

const PORT = process.env.PORT || 4000; // PORT used in production or 4000

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());

app.get("/", (req, res) => {
  res.render("index"); // automatically find the index.ejs
});

app.get("/users/register", (req, res) => {
  res.render("register"); // automatically find the index.ejs
});

app.get("/users/login", (req, res) => {
  res.render("login"); // automatically find the index.ejs
});

app.get("/users/dashboard", (req, res) => {
  res.render("dashboard", { user: "Conner" }); // automatically find the index.ejs
});

app.post("/users/register", async (req, res) => {
  let { name, email, password1, password2 } = req.body;
  // console.log({ name, email, password1, password2 });

  let errors = [];

  if (!name || !email || !password1 || !password2) {
    errors.push({ message: "Please enter all fields." });
  }

  if (password1.length < 6) {
    errors.push({ message: "Password must be at least 6 characters." });
  }

  if (password1 !== password2) {
    errors.push({ message: "Passwords do not match." });
  }

  if (errors.length > 0) {
    return res.render("register", { errors });
  } else {
    // Passed form validation
    let hashPassword = await bcrypt.hash(password1, 10);

    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (error, result) => {
        if (error) {
          throw error;
        }

        // console.log(result.rows);

        if (result.length > 0) {
          errors.push({ message: "Email already exists." });
          return res.render("register", { errors });
        } else {
        }
        pool.query(
          `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password`,
          [name, email, hashPassword],
          (error, result) => {
            if (error) {
              throw error;
            }

            console.log(result.rows);
            req.flash("success_msg", "You are now registered, please log in.");
            return res.redirect("/users/login");
          },
        );
      },
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
