import routes from "../routes";
import UserModel from "../models/User";
import passport from "passport";

export const userDetail = (req, res) => {
  res.render("userDetail.pug", { pageTitle: "USER DETAIL" });
};

// JOIN CONTROLLER

export const getJoin = (req, res) => {
  res.render("join.pug", { pageTitle: "JOIN" });
};
export const postJoin = async (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  if (password !== password2) {
    res.status(400);
    res.render("join", { pageTitle: "Join" });
  } else {
    try {
      const user = await UserModel({ name, email });
      console.log(user);
      await UserModel.register(user, password);
      next();
    } catch (error) {
      console.log(error);
      res.redirect(routes.home);
    }
  }
};

// LOGIN CONTROLLER

export const getLogin = (req, res) => {
  res.render("login.pug", { pageTitle: "LOGIN" });
};

export const postLogin = passport.authenticate("local", {
  successRedirect: routes.home,
  failureRedirect: routes.login,
});

export const logout = (req, res) => {
  res.render("logout.pug", { pageTitle: "LOGOUT" });
};
