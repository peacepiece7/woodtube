import alert from "alert";
// global routes

const HOME = "/";
const SEARCH = "/search";
const JOIN = "/join";

// user routes
const USERS = "/users";
const USER_DETAIL = "/:id/userDetail";
const USER_EDIT = "/:id/userEdit";

const LOGIN = "/login";
const LOGOUT = "/logout";

// video routes
const UPLOAD = "/upload";
const VIDEOS = "/videos";
const VIDEO_DETAIL = "/:id/detail";
const VIDEO_EDIT = "/:id/edit";
const VIDEO_DELETE = "/:id/delete";

const routes = {
  home: HOME,
  search: SEARCH,
  users: USERS,
  userEdit: USER_EDIT,
  join: JOIN,
  login: LOGIN,
  logout: LOGOUT,
  userDetail: USER_DETAIL,
  videos: VIDEOS,
  upload: UPLOAD,
  videoDetail: (id) => {
    if (id) {
      return `/${id}/detail`;
    } else {
      // alert("plz check a video id (ref:routes.js)");
      return VIDEO_DETAIL;
    }
  },
  videoEdit: (id) => {
    if (id) {
      return `/${id}/edit`;
    } else {
      return VIDEO_EDIT;
    }
  },
  videoDelete: (id) => {
    if (id) {
      return `/${id}/delete`;
    } else {
      return VIDEO_DELETE;
    }
  },
};

export default routes;
