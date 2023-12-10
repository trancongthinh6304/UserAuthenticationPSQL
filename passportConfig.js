const LocaleStrategy = require("passport-local").Strategy;
const { pool } = require("./dbCofig");
const bcrypt = require("bcrypt");

function initialize(passport) {
      const autheticateUser = (email, password, done) => {
    pool.query(
      `SELECT *
             FROM users
             WHERE email = $1`,
      [email],
      (error, result) => {
        if (error) {
          throw error;
        }

        console.log(result.rows);

        if (result.rows.length > 0) {
          const user = result.rows[0];

          bcrypt.compare(password, user.password, (error, isMatch) => {
            if (error) {
              throw error;
            }

            if (isMatch) {
              return done(null, user); // done(error, user) - return user and store in the session cookies
            } else {
              return done(null, false, {
                message: "Password does not correct.",
              });
            }
          });
        } else {
          return done(null, false, { message: "Email is not registered." });
        }
      },
    );
  };

  passport.use(
    new LocaleStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      autheticateUser,
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    pool.query(
      `SELECT *
             FROM users
             WHERE id = $1`,
      [id],
      (error, result) => {
        if (error) {
          throw error;
        }
        return done(null, result.rows[0]);
      },
    );
  });
}

module.exports = initialize;
