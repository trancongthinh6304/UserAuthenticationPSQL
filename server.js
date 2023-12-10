const express = require("express");
const app = express();
const { pool } = require("./dbCofig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const initializePassport = require("./passportConfig");

initializePassport(passport);

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
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.render("index"); // automatically find the index.ejs
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user.name });
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
      `SELECT *
             FROM users
             WHERE email = $1`,
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
          `INSERT INTO users (name, email, password)
                     VALUES ($1, $2, $3)
                     RETURNING id, password`,
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

app.get("/users/logout", (req, res) => {
  req.logout((error) => {
      if (error) {
          throw error;
      }
      req.flash("success_msg", "You have logged out.");
      return res.redirect("/users/login");
  });
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
);

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users/dashboard");
    }
    return next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/users/login");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
