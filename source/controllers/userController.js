import routes from "../routes";
import UserModel from "../models/User";
import passport from "passport";

// USER DETAIL

export const userDetail = (req, res) => {
  const user = req.user;
  console.log(req.user);
  res.render("userDetail.pug", { pageTitle: "USER DETAIL", user });
};

// EDIT USER

export const getUserEdit = (req, res) => {
  const user = req.user;
  res.render("userEdit.pug", { pageTitle: "EDIT PROFILE", user });
};

export const postUserEdit = async (req, res) => {
  const {
    body: { name },
    file,
  } = req;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      avatarUrl: file ? file.path : req.user.avatarUrl,
      name: name ? name : req.user.name,
    });
  } catch (error) {
    console.log(error);
  }
  res.redirect(routes.home);
};

// JOIN CONTROLLER

export const getJoin = (req, res) => {
  res.render("join.pug", { pageTitle: "JOIN" });
};
export const postJoin = async (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  if (password !== password2) {
    res.status(400);
    req.flash("info", "password is not collect");
    res.render("join", { pageTitle: "Join" });
  } else {
    try {
      const user = await UserModel({ name, email });
      await UserModel.register(user, password);
      next();
    } catch (error) {
      req.flash("duplication", "ID or Email is duplacated");
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
  req.logout();
  res.redirect(routes.home);
};
