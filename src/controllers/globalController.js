import routes from "../routes";
import VideoModel from "../models/Video";

export const home = async (req, res) => {
  try {
    const VIDEOS = await VideoModel.find({});
    // console.log(`현제 업데이트 된 VIDEO 목록 ${VIDEOS}`);
    console.log(`🍉 current login data is ${req.user}`);
    res.render("home.pug", { pageTitle: "HOME", VIDEOS });
  } catch (error) {
    console.log(`homeController error by ${error}`);
    res.status(404);
  }
};

// search controller
export const search = async (req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  try {
    const VIDEOS = await VideoModel.find({
      title: { $regex: obj.search, $options: "i" },
    });
    res.render("search.pug", { pageTitle: `SEARCH BY: ${obj.search}`, VIDEOS });
  } catch (error) {
    console.log(`searchController error : ${error}`);
    res.redirect(routes.home);
  }
};
