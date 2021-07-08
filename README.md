# updated 2021, Local Join

> User Schema 작성
> controller(getJoin, postJoin), join.pug, router.js 작성
> postJoin -> User.js 데이터 저장 되는지 확인 (비밀번호 노출 됨)
> > DB에 password를 저장하면 안됨, 비밀번호를 해싱해서 저장해야 함 
> > bcrpt or passport 사용


<br>
<br>
<br>



### User Schema 작성

User.js 아래와 같이 작성 

```js
// User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {type : String, required : true, unique : true},
  email: {type : String, required : true, unique : true},
  avatarUrl: type : String,
  facebookId: Number,
  githubId: Number,
  location : String,
});
const model = mongoose.Model("User", UserSchema);

export default model
```

unique 구버전 경고 뜨면 mongoose.connect("address",{ useCreateIndex : true } 추가

<br>
<br>
<br>

### 회원가입 라우터 작성



```js
// userController.js

export default getJoin = (req,res) => res.render("join", {pageTitle : "join"})
export default postJoin = (req,res) => res.render("join", {pageTitle : "join"})
```


```pug
// join.pug

extends base

block content
    form(method="POST")
        input(name="name", type="text", required)
        input(name="email", type="email", required)
        input(name="username", type="text", required)
        input(name="password", type="password", required)
        input(name="location", type="text", required)
        input(type="submit", value="Join") 
```

### Post Join

```js
// userController.js

export const postJoin = async (req, res) => {
  const { name, username, email, password, location } = req.body;
  await User.create({
    name,
    username,
    email,
    password,
    location,
  });
  return res.redirect("/login");
```

<br>
<br>
<br>

### bcryt ( password hashing )

User Model에 bcrypt 작성

`npm install bcrypt`

```js
// User.js

import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: String,
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 5);
});

const User = mongoose.model("User", userSchema);
export default User;
```

mongo -> use wetube -> db.user.find({}) => ...  password : "asdjiwdje12kl3kas4tlasndl"  이런식으로 저장됨

<br>
<br>
<br>

### Duplicatied Accouont Check

email,name이 중복될 때, 비밀번호가 일치하지 않을 때, 아래와 같이 작성해서 에러 메시지를 표시하게 만들자

 User.exists({ $or: [{ username }, { email }] }) $or operator는 email = true or name = true 일 경우 true를 말함
 
 username : req.body.username, email : req.body.email임
 
 따로 두 개 작성해도 될 듯.

```js
// userController.js

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }

....
...
..
.

```

<br>
<br>
<br>

### Login Status

로그인이 실패해도 브라우저가 비밀번호 저장할지 물어보기도 함 이럴 때 status code로 실패함을 알려주자.
video 렌더링 할 때도 status를 지정해줘야 잘못된 페이지가 브라우저 히스토리에 안 남음

`res.status(404).render("templete.pug")`

<br>
<br>
<br>
# Comment Section (#16.1 - #16.9) 

<br>
<br>

# RECAP

1. comment model을 만든다.
2. videoDetail.pug에 form textarea, button을 작성한다. ( no method, no value )
3. videoId를 알기위해 dataset을 지정한다.
4. router. controller 경로를 만들어준다. 
5. bodyParser.json(), bodyParser.text(), regenerator-runtime을 상황에 맞게 사용한다.
6. commetSection.js에 fetch api를 사용하여 textarea.value를 body에 실어서 POST로 /apis/videoId/comment router로 보낸다. 
7. apiContoller.js에서 request된 textarea.value를 commentModel에 등록한다.
8. fake comment(reload하지 않아도 comment가 바로 보이도록)와 delete comment를 만들어준다.

<br>
<br>

# videoDetail.pug

video dataset을 해주고, form을 작성, button ( no submit, no value, no name )
text만 받아서 fetch로 보낼 거니까 reload되선 안 된다.

```pug 
video.video(src=video.fileUrl controls=true data-videoid=video._id)

...
..

form#video-comments-form
            input(type="textarea")
            button#submitCommentBtn Post Submit
```

<br>
<br>

# Comment Models 

아래와 같이 작성, Video.js, User.js에 각각 comments를 배열로 받는 스키마를 만들어 준다.

```js
// Comments.js

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
});

const CommentModel = mongoose.model("Comment", commentSchema);

export default CommentModel;

```

init.js에 import 해준다.

```js
// init.js

import "dotenv/config"
import "./db"
import "./models/Comment.js"
import "./models/User.js"
import "./models/Video.js"
```
<br>
<br>

# comment fetch()
                          
                          

textarea에 작성한 받아온 댓글을 fetch("/api/videos/:id/comment")로 POST

fetch로 받은 페이지를 controller router에 작성한다.


```js
// apiRouter.js

apiRouter.post("/videos/:id/comment", createComment);


// videoController.js
 
export const createComment = (req, res) => {
  let parsingRequest = JSON.parse(req.body);
  res.end();
};

// server.js

app.use(bodyParser.json());
```

commnetSection.js 파일을 만들고 webpack과 연결, 아래와 같이 작성해준다.

```js
const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");

const handleSubmit = (event) => {
  event.preventDefault();
  const video = videoContainer.dataset.videoid;
  let text = textarea.value;
  JSON.stringify(text);
  fetch(`/api/videos/${video}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
};

btn.addEventListener("submit", handleSubmit);
```

이제 위의 코드들을 하나씩 설명해보자

1. event.preventDefault();

이 코드가 없으면 fetch가 기본적으로 reload를 하기 때문에 콘솔이 지워진다.
잘 기억해두자.

2. btn.addEventListener("submit", handleSubmit);

click이 아니라 submit이다.
button을 클릭했을 때, submit event가 일어나고 dom api는 submit docs를 가져온다. 
submit docs에 있는 method에 preventDetault가 있기 때문에, "click"이 아니라 "submit"을 해야한다. 

2. fetch

JSON.stringify({ textarea.value })이렇게 comment에 적은 text를 JSON화 해서 POST method로 보낸다.
headers에 json임을 명시해줘야한다. 

만약 plain text를 보낸다면, headers : text/html, body-parser.text()를 설정해주면 되겠다. 아래 설명을 참고하자


3. body-parser

req.body에 데이터를 넣기 위해서는 body-parser를 이용해야한다. 

bodyParser는 여러 메서드가 있다 지금 알아야할 것은 아래와 같다.

```js
// url로 이동할 때 전송한 데이터를 body에 넣을려면 urlencoded 메서드를 사용한다.
app.use(bodyPaser.urlencoded({extedned:false}))

// fetch로 text를 전송할 때 사용한다.
app.use(bodyParser.text());

// fetch로 json을 전송할 떄 사용한다.
app.use(bodyParser.json());
```

4. JSON.stringfy(), JSON.parser()

JSON.stringfy() : object를 json으로 변환한다.

JSON.parse() : json을 object로 변환한다.

5. fetch POST로 보낼 떄 필요한 것

fetch로 객체를 post할 경우 bodyParser.json()과 JSON.stringify()가 필요하다. (JSON으로 만들어서 보내기)
또는,  
fetch로 텍스트를 post할 경유 bodyParser.text()를 해주면 된다.

6. fetch POST -> req.body로 받아올 떄 필요한 것

JSON 객체가 body에서 가져오면 js는 이를 텍스트로 인식한다. 그래서 headers : "Content-Type": "application/json", 를 작성해 줌으로 
보낸 데이터가 json임을 알려준다.
아니면
JSON.parse(req.body)를 해서 객체로 변환해 줘도 된다.

# 왜 fetch().then((response) => console.log(response))는 동작하지 않는가? 

[nodejs는 왜 304코드를 반환하는가 ](https://huns.me/development/2306)




# PUG

### include, extends(block)

**include**

**extends(block)**

### block content

### pug 주석

검사기에 코드가 출되는 주석

`//`

노출되지 않는 주석

`//-`

## src=video.videoFile vs h1 #{video.videoFile}

pug에서 js의 변수를 불러 올때 두 가지 방식이 있음

1. equal

```pug
video(src=FakeDb.videoFile)
h6=FakeDb.title
```

2. object literal

```pug
video(src #{FakeDb.videoFile})
h6 #{fakeDb.title}
```
<br>
<br>

# express app.get

```js
function handleHome(req, res) {
  res.send("hellow form home");
}

app.get("/", handleHome);
```

<br>
<br>

# package.json의 dependency vs devdependency

**dependency**  
의존이란 뜻으로, 개발환경에 영향을 주는 모듈을 뜻한다.
빌드 시 포함되어야 한다.

**devdependency**  
개발자에 의존하는 것, 개발환경에 영향을 주지 않고 개발자에게 편의를 제공하는 모듈을 뜻한다.<br>
마지막에 -D or --save-dev 를 붙여서 다운로드 하면 된다.
nodemone, babel-preset-env처럼 개발 환경에서만 쓰이는 모듈을 뜻함

`npm install moduleName -D`

<br>
<br>

# express app.use

```js
app.use(function (req, res, next) {
  res.send("Hello World");
});
```

<br>

순차적으로 실행되는 **미들웨어**
```js
app.use(function (req, res, next) {
  console.log("hellow world");
  next();
});
```
위와 같이 미들웨어로서의 역할을 하려면 next()로 다음 함수로 넘어가도록 해줘야함  
미들웨어 모듈로 get,post등을 res인자로 사용할 수 있음  
/home/login, /home/logout 이런식으로 라우팅 할 수 있음

<br>
<br>

# JS export, export defalut

#### export

export로 함수를 내보낸다면 아래와 같이 작성할 수 있다.

```js
export const sayhi = () => {
  console.log("hi");
};

//  아래에 묶어서 사용할 수 있다.

function sayHellow() {
  console.log("heelow");
}
function sayBye() {
  console.log("bye");
}

export { sayBye, sayHellow };
```

export 한 함수를 받아올 땐 아래와 같이 작성


```js
import { sayBye, sayHellow } from "/user.js";

// 받아올 데이터가 많일 경우엔 esterisk 
import * as user from user.js
```

> 가져올 떈 구체적인 사항을 명시하는 것이 로딩 속도를 올리는데 좋음

#### export default

export default를 사용하면 **해당 모듈엔 개체가 하나만 있다** 는 사실을 명확히 나태낼 수 있다.<br>
모듈 전체를 하나의 개채로 지원함

```js
// 📁 user.js
export default class User {
  // export 옆에 'default'를 추가해보았습니다.
  constructor(name) {
    this.name = name;
  }
}
```

```js
// 📁 main.js
import User from "./user.js"; // {User}가 아닌 User로 클래스를 가져왔습니다.

new User("John");
```

이런식으로 주고 받을 수 있음

| named export            | default export                  |
| :---------------------- | :------------------------------ |
| export class User {...} | export default class User {...} |
| import {User} from ...  | import User form ...            |

express에서 아래와 같이 사용할 수 있음

```js
// main.js

import express from "express";
const app = express();
app.get("/", filehandler);

export default app;
```

```js
// sub.js

import app from "./main.js";
app.listen(3000);
```


❗️❗️❗️ 매우중요한 거

file:로 브라우저에서 script를 열면, export import가 작동하지 않으니까 주의!!<br>
http로 통신해야 작동합니다.

<br>
<br>

# express.Router()

[express.Router()](https://expressjs.com/en/4x/api.html#express.router)<br>

end 포인트의 /url을 만들거나(get함수를 사용해서)<br>
app.use()의 middleware를 만들 수 있다.(로그인이나 인증 할 떄)

```js
// router.js

const router = express.Router([options]);

router.use(function (req, res, next) {
  // .. some logic here .. like any other middleware
  next();
});

router.get("/events", function (req, res, next) {
  // you can express like above ex) res.render("main.pug");
});

export default router
```

calendar/events 아렇게 **precedence(parents route)가 calendar인 mini app을 만들 수 있다.**

```js
// main.js

import router from "./router.js"
app.use("/calendar", router);
```



--------------------------------------------------------------




# nodeJS 다운받기

[nodejs API document](https://nodejs.org/api/)

공식 사이트에서 다운받거나 brew를 사용해서 다운로드

<br>
<br>

# node 시작하기

index.js를 만든 다음

터미널에 아래내용을 입력

```terminal
npm init
```

실행한 후 내용을 입력

package.json생성

<br>
<br>

# express 설치하기

[express API document](https://expressjs.com/)

터미널에 아래내용을 입력

```terminal
npm install express
```

package.json을 보면

```
"dependencies" :{
    "express" : "version"
}
```

이렇게 버전이 생성된걸 볼 수 있음

<br>
<br>

# .gitignore

git에 push하기전에 올리면 안되거나 용량이 많아서 굳이 올릴 필요가 없는 목록을 미리 .gitignore에 올릴 수 있다.

.gitignore란 파일을 만들고,

[nodejs ignore list](https://github.com/github/gitignore/blob/master/Node.gitignore)
여기에 있는 양식을 그대로 복사해서 붙여넣자,

추가로 pakage-lock.json도 적어주자

<br>
<br>

# frist git push (github)

> 아래 사이트 참조, 깃 데스크탑 안 써도 업로드 할 수 있음
> [how to git upload](https://victorydntmd.tistory.com/53)

git에 repository생성,  
REAMDNE.md 만들고 git에 생성한 repositroty url복사해서 터미널에 아래와 같이 입력

```
git remote add origion https://github.com/peacepiece7/wetube.git

git commit -m "Initail Commit"

git push origin master
```

- 저장소만들면 이렇게 잘 나와있음 (readme 만들면 안됨)
  **…or create a new repository on the command line**<br>
  echo "# wetube" >> README.md<br>
  git init<br>
  git add README.md<br>
  git commit -m "first commit"<br>
  git branch -M main<br>
  git remote add origin https://github.com/peacepiece7/wetube.git<br>
  git push -u origin main<br>
  **…or push an existing repository from the command line**<br>
  git remote add origin https://github.com/peacepiece7/wetube.git<br>
  git branch -M main<br>
  git push -u origin main<br>
  **…or import code from another repository**<br>
  You can initialize this repository with code from a Subversion, Mercurial, or TFS project.<br>

<br>
<br>

# 터미널로 git init하기

memojang-ellie에 자세히 적어둠,

`git init`    
`git status`    
`ls -l` 로 .git 확인  

`echo node_modules >> .gitignore`  
.gitignore에 package, .env 등등 추가

`git add *`  
`git log`  
`git commit -m "first message"`  

<br>
<br>


# script에 커맨드 지정하기

```js
const express = require("express");
const app = express();

const PORT = 4000;

function handleListening() {
  console.log(`Listening on : http://localhost:${PORT}`);
}
app.listen(PORT, handleListening);
```

이걸 실행하려면 터미널에

`node index.js`

라고 쳐야하지만 귀찮으니까 package.json에 scripts를 추가해주자

```
// package.json
 "scripts": {
    "start": "node index.js"
  },
```

<br>
<br>

# babel 시작하기

[babel](https://babeljs.io/)

[babel참고자료](https://babeljs.io/docs/en/babel-preset-env)

# 2021 babel

babel은 다양한 플러그인(babel - 내가 작성한 es6 를 연결, vanilla js로 변환까지 함)을 지원하는데

@babel/preset-env가 제일 유명함 그 이외 @babel/reeact나 @babel/typscript 등등 많은 플러그인이 있음

babel core는 complier로 es6를 vanilla로 변환해 주는 역할, babel을 사용한다면 반드시 받아야 함

npm install --save-dev @babel/core 
npm install --save-dev @babel/preset-env

`touch babel.config.json` 파일을 만들고

아래와 같이 작성

```js
// babel.config.json
{
    "presets": [
      ["@babel/preset-env",{"useBuiltIns":"entry","corejs":3}]
    ]
  }
```

# 2020 babel 

터미널에 아래 내용을 입력

bebel-node script로 컴파일할 수 있게 해준다,
beble-core 바벨 트렌스 레이터의 기능을 함
bebel-preset-env 플러그인의 종류 중 하나, 가장 많이 사용하고 최신 js문법을 지원한다. 
그외 preset-react, preset-typescript등등 많다.


```
npm install @babel/node
npm install @babel/core
npm install @babel/preset-env
npm install core-js@3
```

 .babelrc 파일을 만들고 아래 내용을 입력해준다.

```js
// .babelrc
{
    "presets": [
      ["@babel/preset-env",{"useBuiltIns":"entry","corejs":3}]
    ]
  }
```

package.json도 script start를 아래 내용으로 바꿔준다.
`"bable-node index.js"`

<br>
<br> 

# npm package nodemon

[nodemon](https://www.npmjs.com/package/nodemon)<br>
[nomemon doc](https://www.npmjs.com/package/nodemon)

`npm install nodemon -D`

package.json을 아래로 변경

`"start": "nodemon --exec babel-node index.js"`

above code work automatically restarting when you modifiied applications<br>
공식 문서를 보면 pug추가하는 법이 나와있고(추가해놓긴 했는데 아마 scss도 가능할 듯)<br>
delay주는 방법이나 따로 culry blanket을 만들어서 옵션을 추가하는 법등 다양하게 나와있음

<br>
<br>

# npm package morgan

[morgan](https://www.npmjs.com/package/morgan)

Dexter Morgan이라는 드라마의 인물로 혈흔을 분석하고 밤에는 시리얼 킬러로 활동함br>
혈흔을 분석해서 package name을 morgan아라고 지었나봄<br>

- 로그인 할 떄 로그관리를 할 수 있게 도와주는 미들웨어

`npm install morgan`
으로 다운 받음

reaeme에서는 var, require로 사용해라지만 이제 var는 쓰지 않으니까 import해주자

```js
var morgan = require("morgan");
import morgan from "morgan";
```

아래와 같이 실행하면

```js
app.use(morgan("combined"));
```

이와 같은 로깅값을 얻을 수 있다.

```
::1 - - [01/Mar/2021:03:12:44 +0000] "GET / HTTP/1.1" 304 - "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36"
```

여러 옵션들이 있는데 combined에서 부분적으로 짤라내서 보여줌

```js
app.use(morgan("short"));
app.use(morgan("tiny"));
app.use(morgan("short"));
app.use(morgan("dev"));
```

옵션에서 특정 값을 만족할 때만 랜더링하는 if문을 넣는 식으로 쓴다고 함, token , http setting부분은 잘 모르겠다.. fs가 file system이랑 관련있다는 거 정도..?

<br>
<br>

# npm package cookie parser

[cookie parser](https://www.npmjs.com/package/cookie-parser)

`npm install cookie-parser`

<br>
<br>

# npm package body parser

[body-parser](https://www.npmjs.com/package/body-parser)

`npm install body-parser`

데이터를 body에 담아서 app.post()로 보낼 때 body-parser가 없으면 undefined를 받게 되기 때문에 사용해야 한다.

이런 형식의 body를 보낼 때를 말함

```js
{
  userID : "힝",
  password : "나도몰라"
}
```

하지만 [body-parser](https://medium.com/@chullino/1%EB%B6%84-%ED%8C%A8%ED%82%A4%EC%A7%80-%EC%86%8C%EA%B0%9C-body-parser%EB%A5%BC-%EC%86%8C%EA%B0%9C%ED%95%A9%EB%8B%88%EB%8B%A4-%ED%95%98%EC%A7%80%EB%A7%8C-body-parser%EB%A5%BC-%EC%93%B0%EC%A7%80-%EB%A7%88%EC%84%B8%EC%9A%94-bc3cbe0b2fd)가 없어서도 이렇게 하면 쓸 수 있다고 함.<br>
나중에 참고해서 읽어보자

> json으로 body parsing하기

```js
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// json으로 body parsing할 때 써보자
// parse application/json
app.use(bodyParser.json());

app.use(function (req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.write("you posted:\n");
  res.end(JSON.stringify(req.body, null, 2));
});
```

나중에 json형식으로 데이터를 주고 받을 떄 쓸 수 있을 듯 나중에 req로 확인해보자,,

<br>
<br>

# router를 따로 분리해서 적기

Router file을 따로 만들어서 관리하기

```js
// router.js
import express from "express";

// userRouter말고도, videoRouter, globalRouter등을 만들 것이기 때문에 export default를 하지 않는다.
export const userRouter = express.Router();

userRouter.get("/edit", (req, res) => {
  res.send("edit index");
});
```

필요한 라우터를 작성하고, app init에서 app.use로 parent route 설정해주기

```js
// app,js
import { userRouter } from "./main.js";
app.use("/user", userRouter);
```

이렇게 하면 localhost:xxxx/user/edit 이라는 라우터가 만들어 졌다.

<br>
<br>

# routes 파일로 라우터 이름 모아서 관리하기!

`routes.js`

파일을 만들어서

```js
// routes.js
const routes = {
  home : HOME,
  user : USER,
  userDetail : USER_DETAIL,
  join : JOIN,
  login : LOGIN.
  logout : LOGOUT
}

const HOME = '/'
const USER = '/user'
const USER_DETAIL = '/:id/'
const JOIN = '/join'
const LOGIN = '/login'
const LOGOUT = '/logout'

export default routes
```

routes를 사용해야할 때 "home","userDetail".. 이런 식으로 외워서 쓰지 않고  
routes.user, routes.home 이런식으로 작성해준다.

```js
//routers.js
import routes from "./routes.js";
import express from "express";

const app = express.Router();

app.get(routes.home, (req, res) => res.send("home page!"));
app.get(routes.user, (req, res) => res.send("user page"));
// 기존방식으로 쓰면 아래와 같다.
app.get("/join", (req,res) => res.send("join Page!")
app.get("/login", (req,res) => res.send("login page!"))
```

이런식으로 내가 라우팅할 페이지의 이름을 정해두면,  
나중에 조건문을 써서 페이지를 랜더링 해야할 때(아이디가 일치할 경우나, 특정 조건이 맞을 경우)  
작성이 수월해진다.  
(근데 이 방식은 케바케인듯 나는 그냥 한 곳에 다 쓰는게 편핼 거 같은뎅)

<br>
<br>

# router 순서 확인 하기!

router.js 파일은 아래와 같이 적혀있고

```js
router.get(routes.detail, (req, res) => {
  res.send("detail");
});
router.get(routes.editProfile, (req, res) => {
  res.send("edit-profile");
});
```

routes.js는 아래왜 같이 적혀있음,

```js
const detail = "/:id";
const editProfile = "/edit-profile";
```

이 경우 localholst:4000/edit-profile 로 접속한다면
우리는 localholst:4000/detail 로 접속하게 됨, 왜냐하면
edit-profile를 id로 인식하기 떄문, 그래서 아래와 같이 순서를 바꿔서 적어줘야함

```js
router.get(routes.editProfile, (req, res) => {
  res.send("edit-profile");
});
router.get(routes.detail, (req, res) => {
  res.send("detail");
});
```
<br>
<br>

# MVC

#### MVC 모델 소개

MVC (Model View Controller)

M = data(그림판에 넣을 데이터)<br>
V = how does the data look(그림판)<br>
C = function that looks for the data(그림판으로 가는 기능 컨트롤러)<br>

앞으로 MVC를 사용해 아래 것들을 만들거임

#### Model은 mongodb로 data를 저장하고
#### view는 pug,scss를 사용해서 화면을 꾸미고
#### Controller는 CRUD+login등 기능들을 구현하는 오브젝트를 만듬(controller는 view, seaching, login, data parsing등 다양함)
   ⚠ Modules work only via HTTP(s), not in local files

|If you try to open a web-page locally, via file:// protocol, you’ll find that import/export directives don’t work.|
|Use a local web-server, such as static-server or use the “live server” capability of your editor, |
|such as VS Code Live Server Extension to test modules.|

####  MVC 방식으로 controller 작성하기

controller.js 파일을 만들어서 router.js에서 랜더링해오는 페이지를 작성하는 부분을 따로 작성해준다.  
제어하는 부분을 따로 만들어주는 것!

```js
// controller.js
export const home = (res, req) => res.send("home page!");
```
export const home을 다른 파일에서 부를땐  
아래와 같이 작성하면 된다.  
import {home} form "controller.js"

```js
import express from "express";
import routes from "./routes.js";
// import는 직접 안 적어도 알아서 적어짐( 헷갈리지 않게 직접 적어도 되공 )
import { home } from "./controller.js";

const app = express.Router();

app.get(routes.home, home);
```

<br>
<br>

# PUG (view engin)



`npm install pug`

terminal에 위와 같이 작성함

```js
// app.js

app.set("view engin", "pug");
```

view/home.pug를 만들고 내용을 작성하면 됨

<br>
<br>

## 폴더 위치를 수정하고 싶다면

```js
app.set("views", __dirname + "/views");
```

이렇게 /views로 시작하는 폴더 안에 pug를 넣겠다 라고 지정할 수 있는데  
기본 default가 /views이기 떄문에 굳이 적을 필요는 없다.

express documemt에 가보면  
views는 process.cwd() + "/views" 라고 되어 있는데  
아래와 같이 적어ㅓ 확인해 볼 수 있다.

```js
// 내장 함수
console.log(`__dirname`, __dirname);
console.log(`process.cwd()`, process.cwd());
// app_root_path는 npm 따로 설치 해야 함
console.log(`app_root_path`, app_root_path);
```
1 라인 : 현제 실행하는 파일의 절대경로를 의미한다.  
2 라인 : 현제 실행한 node js의 파일 경로를 의미함을 알 수 있다.  
3 라인 : 프로잭트 루트를 찾아준다.  

[참고 nodeJs doc](https://nodejs.org/docs/latest/api/modules.html#modules_dirname)

[참고 app_root npm doc](https://www.npmjs.com/package/app-root-path)



<br>
<br>

# plain html, css를 view engin으로 사용하고 싶다면?

[참고 블로거](https://velopert.com/294)

public 이란 폴더를 만들어서 css를 저장

#### views란 폴더를 만들어러 html 저장
#### npm install ejs
#### html랜더링 해오기, 폴더 위치는 상관없음

```js
app.get("/", (req, res) => render("index.html"));
```

#### app.js에서 이렇게 app.set을 설정해준다.

사실 이 부분은 express api에서 봤는데 이해가 잘 안 됬음... ejs란 패키지를 처음 봐서 그런 듯 ㅎ;  
위 사이트에서 ejs에 관해 알려줌

```js
var express = require("express");
var app = express();
var router = require("./router/main")(app);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

var server = app.listen(3000, function () {
  console.log("Express server has started on port 3000");
});
```

3번 째 줄은 router를 app으로 보낸다는 의미고,
5번째 줄은 server가 이해할 수 있게 html이 어디에 위치해 있는지를 정의해 줌
6-7줄은 서버가 html을 랜더링 할 때 ejs를 사용하라고 알려준는 것

#### static file 다루기

static file은 .js .css image file 등 을 말한다고 함

```js
app.use(express.static("public"));
```

이렇게 static파일의 위치를 지정해주면 된다, public 이란 폴더를 만들어서 그 안에 css. js 랜더링된 페이지에서 정적으로 작동할 파일을 넣겠다는 의미

<br>
<br>

# 왜 pug를 써야하나? ( block, extends )

에전엔 몰랐는데 큰 프로젝트를 할 경우 일일이 html을 수정하면 매우 귀찮아질 수 있다고 함  
이때 .html이 지원하지 않는 기능이 있는데

block, extends 임

html skeleton 을 작성하기 위해 ./layouts/main.pug 파일을 만듬

block "name"

을 추가해줌

```pug
doctype html
html
    head
        title WeTube
    body
        main
            block content
        footer
            span &copy; WeTube
```

이제 확장할 pug 파일에 extends - block을 사용함

home.pug 에 확장해보자

```pug
extends layouts/main
block content
    p hellow world
```

이렇게 작성하면 main.pug의 내용이 모두 home.pug로 옮겨지고,
block content 다음 줄에 indent한 내용은 main.pug
의 main tag안에 작성하는 것 처럼 같은 내용을 가질 수 있음

<br>
<br>

# inclue로 partials 추가하기

./views/partails/header.pug
를 만들어서 아래와 같이 작성(내용은 중요치 않음)

```pug
// header.pug
header.header
    .header__column
        i.fab.fa-youtube
    .header__column
        ul
            li
                a(href="#") Join
            li
                a(href="#") Log In
```


```pug
doctype html
html
    heder
        title hellow world page
    include ../partials/header.pug
    body
        block content
    footer

```

header.pug에 header tage가 있으니까 include ../partials/header.pug 해줌!  
차이가 있는진 모르겠는데 header.pug에 header tag빼고 클래스만 적어도 작동함 ㅇㅇ
이건 적다보면 감으로 알듯

<br>
<br>

# Local Variable 만들기 ( in Pug )

#### middlewares.js 파일을 만듬

아래와 같이 작성하면, 지역변수로 res.locals.siteName = "wetube", res.locals.routes = routes  설정된다.

```js
// middlewares.js

import routes from "./routes";

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "wetube";
  res.locals.routes = routes;
  next();
};
```
```js
// app,js

import { localsMiddleware } from "./middleware";

//blah blah..

app.use(localsMiddleware);

// blahblah..
```

위와 같이 app.js에 middleware를 추가해 준다.

#### pug에 지역변수 사용하기

.js의 지역변수를 .pug에서 사용하려면

`#{지역변수명}`

을 입력해주면 된다.

`title #{siteName}`

변수와 문자열을 같이 사용할 경우는 위와 같이 작성하고


```pug
a(hef=routes.join) go to Join!
a(hef=routes.login) go to login!
```

routes obj의 라우터 명을 가르키는 값을 지역 변수로 지정할 수 있다.

<br>
<br>

# Object Literals 객체 리터럴

객체 초기자(object literal)을 선언

```js
// 첫 번째 방법
const obj1 = {};
// 두 번째 방법
const obj2 = new Object();
```

아래 처럼 routes 경로를 설정할 떄 사용했던 방식이 바로 객체 리터럴

```js
const HOME = "/";
const SEARCH = "/search";
const LOGIN = "login";

const routes = {
  home = HOME,
  search = SEARCH,
  login = LOGIN,
}
```
```js
// controller.js
export const home = (req, res) => res.render("home.pug", { pageTitle: "Home" });
```

```pug
// home.pug
title #{pageTitle} | #{siteName}
```

이렇게 작성할 수 있다
<br>
<br>

# search controller 작성하기 (get method, url로 searching하기)

main.pug에 html 파일에 text를 받아서 url로 보내는 메서드를 작성함

```pug
form(action=routes.search, method="get")
  input(type="text", name="term" )
```

text box에 "어떤 단어"를 쓴다면,   
/search 페이지로 넘어가면서 term="어떤 단어" 가 get메소드에 의해 전달됨

controller에서 내가 보낸 "어떤 단어"(text box에)를 확인해 보려면<br>
`console.log(req)`<br>
를 해보면 query : {term : "어떤 단어"}<br>
가 있음을 알 수 있음!<br>

🍎 destructuring assginment (비구조 할당)

- 객체, 배열 두가지를 비구조 할당할 수 있고 각각 방식이 다름!

```js
export const search = (req, res) => {
  const { query : {term : searchingBy } = req;
  }
  res.render(routes.search, { pageTitle: "search", searchingBy});
};
```

위 코드에서 searchingBy는 내가 text로 보낸 "어떤 단어" 아고
searchingBy : searchingBy는 하나만 써서 생략가능

🍎 보이는데로 적는 방식

```js
export const search = (req, res) => {
  const searchingBy = req.query.term;
  res.render(routes.search, { pageTitle: "search", searchingBy });
};
```

+ searchingBy에 promise,  mongoose.findbysomething(searchingBy) 이런 식으로 검색어 데이터를 추출할 수 있지 않을까?

> routes.search를 적을 수 있는 이유는 Middleware에 res.local.routes로 routes를 전역 변수 설정 했기 떄문!

<br>
<br>

# login, join 양식 만들기

- socailLogin.pug를 이렇게 만들어 주고

```pug
.social-login
    button.social-login--github
        span
            i.fab.fa-github
        |Continue with Github
    button.social-login--facebook
        span
            i.fab.fa-facebook
        |Continue with Facebook
```

join or ogin.pug에 아래와 같이 작성해줌 ( block, include는 거의 같이 동작하는데, 전역으로 쓰는지 내부적으로 쓰는지만 다름)

```pug
.social-login
    button.social-login--github
        span
            i.fab.fa-github
        |Continue with Github
    button.social-login--facebook
        span
            i.fab.fa-facebook
        |Continue with Facebook
```

<br>
<br>

# FAkE db 만들기

db를 연결하기 전 fake db를 먼저 만들어서 확인해보기ㅣ

faje db를 routerController에 import 시킨 후

```js
import { fakeDb } from "../db";

export const home = (req, res) => {
  res.render("/home", { fakeDb });
};
```

import된 fakeDb의 title을 each in 으로 반복, 불러올 수 있음  
pug의 each in 은 equal operation을 쓰거나, literal templete을 사용해서 표현할 수 있음

```pug
block content
  .videos
    each video in fakeDb
      //-
        둘 다 사용할 수 있다.
      h1= video.title
      p #{video.description}

```

<br>
<br>

# mixin 사용하기 + 헷갈리는 부분들

mixin을 사용하는 이유는 each in 문으로 제어하기에는 양이 너무 많고, 수정이 번거롭기 떄문!

#### mixin 을 만듬 (directorty : mixin/videoBlock.pug)

```pug
mixin videoBlock(video={})
  .videoBlock
    video.videoTumbnail(src=video.videoFile, controls=ture)
    h6.videoTitle #{video.title}
    h7.videoViews=video.views
```

#### bd를 컨트롤러에 연결시켜서, home.pug로 렌더링 시킴

```js
export const home = (req, res) => {
  res.render("/home", { fakeDb });
};
```

#### mixin을 home.pug에 불러 온다.

```pug
extends layouts/miain.pug
include mixin/videoBlock.pug

block content
  +videoBlock({
    videoFile : fakeDb.videoFile,
    title : fakeDb.title,
    views: fakeDb.views
  })
```
<br>
<br>

# app.get , app.post 사용해서 데이터 주고 받기

```pug
// join.pug

form(action='./' method=post)
  input(type="text" name="id" placeholder="id" )
  input(type="password" name="password1" placeholder="password")
  input(type="password" name="password2" placeholder="check password")
  input(type="submit" value="submit")
```

만약 action="/videos/upload" 일 경우, action="videos/upload" 이런식으로 /를 빠고 적으면 앞에 오는 모든 경로가 다 붙어서 적어짐, 이거 오류 잡는다고 세 시간 걸렸음

위와 같이 로그인을 보내는 양식이 있다면,

```js
// controller.js
export const getJoin = (req, res) => {
  res.render("join.pug", { pageTiele: "join" });
};
export const postJoin = (req, res) => {
  const {
    body: { id, password1, password2 },
  } = req;
  if (password1 === password2) {
    res.render("join.pug", { pageTiele: "join" });
  } else {
    res.redirect(routes.home);
  }
};
```

```js
// router.js
globalRouter.get(routes.join, getJoin);
globalRouter.post(routes.join, postJoin);
```

위와 같이 get, post를 이용해 데이터를 주고 받을 수 있음,  
비밀 번호는 1,2가 같을 경우만 로그인 되도록 설정

<br>
<br>

# content-Security-Policy

외부에서 파일이나 동영상을 다운로드 할 경우 해킹당할 위험이 있기 떄문에 이에 대한 제한이 걸려 있는데  
이를 content-Security-Policy라고 함

> helmet으로 속성을 지정할 떄? "''" 이렇게 더블 쿼트안에 쿼트를 꼭 적어야 함 
> CSP에서 'unsafe-eval'이랑 unsaf-eval을 구분못함..

```js
// 첫 번쨰 방법
app.use((req, res, next) => {
  res.setHeader(
    "ContentSeculityPolicy",
    "scriptSrc 'self' https://archive.org"
  );
  next();
});
// 두 번째 방법 보안을 해제하는 방법
app.use(helmet({ contentSeculityPolicy: false }));

// unsafe-eval
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-eval'"],
      "object-src": "'self'",
    },
  })
);
```
meta 속성에 contecntSeculityPolicy를 우회하는 사이트를 지정해주거나, false로 설정할 수도 있다.

<br>
<br>

# form action 과 get, post 메서드

```pug
// upload.pug
form(action="/videos/upload" method="post")
  input(...)
  input(type="submit" value="submit!")
```

일 경우 "/videos/upload"는 submit을 눌렀을 때,  
post 방식으로(input에 입력한 데이터를 객체로해서) DOMAIN blahblah.../videos/upload 로 **데이터를 전송한다. (페이지를 랜더링 하는게 아님)**

**upload.pug를 렌더링하는 메서드가 get**이고,  
get메서드로 호출된 upload.pug에서 submit!을 눌러서 제출 했을 떄 보낸 **데이터를 받을 페이지가 post메서드로 렌더링한 페이지이다**

```pug
app.get("/videos/upload", (req,res) => {
  res.render(upload.pug)
})
app.post("/videos/upload", (req,res) =>
  res.render(videoDetail.pug)
})
```

이렇게 적으면 upload.pug에서 submit한 데이터를(post 방식으로) videoDetail.pug에 보내

이게 또 헷갈리는 이유가 videoDetail이 id를 받아서 렌더링하는 함수일 떄,
videoDetail.pug가 랜더링 되는 위치 (res.redner(videoDetail.pug)) 를 만들고나서 특정 함수를 redirect하는 기능을 다시 만들어야 함

아래와 같이 post로 받아온 데이터의 id를 입력 받거나, params, id, body등 req객체에서 에서 받아온 속성의 값을 입력하는 방식으로

```pug
app.post("/videos/upload", (req,res) => {
  const {
    body : {id, title, description, concept, sinobsis}
  } = req;
  res.redirect(videoDetail(id))
})

```

<br>
<br>

# res.status

[express res.status](https://expressjs.com/ko/4x/api.html#res.status)

http warrming에 대해서 나와 있음, 페이지가 없다거나, 에러일 경우 행동을 취할 수 있음

<br>
<br>

# router 경로 설정하기

#### login 되었을 경우, 로그인이 되지 않았을 경우 어떤 링크를 보여줄지 정함

로그인 되었을 경우  
header.pug에서 profile(route.userDetail), logout, update를 띄움
로그인이 되지 않았을 경우  
header.pug에서 login, join을 띄움

```pug
ul
    if !user.isAuthenticated
        li
            a(href=routes.join) Join
        li
            a(href=routes.login) Log in
    else
        li
            a(href=routes.upload) Upload
        li
            a(href=routes.userDetail) Profile
        li
            a(href=routes.logout) Log out
```

user.isAuthenticated란 전역 변수를 middleware.js에 설정한 뒤  
로그인 상태면 isAuthenticated=true, 게스트 상태면 isAuthenticated=false가 뜨도록 함

> 임시로 true, false 값을 입력, fakedb와 연동해서 하나씩 만들어 가자

<br>
<br>

### 로그인 되었을 경우, profile 라우팅 설정하기

profile은 routes.userDetail이고 userDetail='/:id'을 가르키고 있음

로그인을 할 때 유저의 id(임시값을 쓰자) 를 db(fakedb를 쓰자)로 부터 받아와서, localhost:4000/:id 로 들어가도록 설정

middleware에 isAuthenticated=true일 경우 id를 받아 오는 오브젝트를 만듬  

```js
res.local.user = {
  isAuthenticated = true,
  id = 112233,
}
```
위와 같이 인증을 전역 변수로 만들어서, 로그인 시 profile 링크를 클릭하면  

localhost:4000/112233 로 접속하도록 만들 거임!

퍼그의 profile link를 클릭하면 localhost:4000/:id 이렇게 뜨기 때문에 아래와 같이 변경

```pug
a(href=`/users/${user.id})`
```

위의 코드를 관리하기 편하도록 아래와 같이 고친 뒤 routes.js 파일에서 id를 받아 라우팅하도록 변경함

```pug
a(href=`/users${routes.userDetail(user.id)}`) Profile
```

```js
const routes = {
  userDetail: (id) => {
    if (id) {
      return `/${id}`;
    } else return USER_DETAIL;
  },
};
const USER_DETAIL = "/:id";
```

### 로그인 설정하기

<br>
<br>

# mongo DB 사용하기

`npm install mongodb`
`npm install mongoose`

일단 세 가지를 다운 받음

mongodb = NoSQL
mongoose = mongoDB controller 임

<br>
<br>

### 터미널에 mongod 입력 아래 내용에서 port : 27017을 찾음

```
{"t":{"$date":"2021-03-24T21:06:45.949+09:00"},"s":"I",  "c":"STORAGE",  "id":4615611, "ctx":"initandlisten","msg":"MongoDB starting","attr":{"pid":17944,"port":27017,"dbPath":"/data/db","architecture":"64-bit","host":"TaeTaeui-MacBookPro.local"}}
```

<br>
<br>

### mongoose로 mongodb연결하기

❌ 이 부분은 mongo atlas랑 헷갈려서 잘못 작성한 부분임 참고하고 아래 mongo 다시연결하는 부분을 보자 ❌
```js
// db.js

import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://we-tube:TvqVp8qGcNy2n8b@cluster0.1vrw1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

const handleOpen = () => console.log("🥕🥕🥕 mongodb is connected");
const handleError = (error) =>
  console.log(`🍑🍑 Error on mongodb connection : ${error}`);

db.once("open", handleOpen);
db.on("error", handleError);
```

그리고 init.js에 db.js를 import 해줌 (다른 곳에 Import 된 db.js 삭제)

```js
import "./db";
```

mkdir -p data/db  
mongod --dbpath data/db

로 db위치가 지정이 안되어 있따면 지정해주기

(여기 기사에서 모든 mongoDB 설치 과정 팁들을 볼 수 있음!)[https://zellwk.com/blog/install-mongodb/]

#### dotenv

`npm install dotenv`
dotenv = documentEnvironment 임

.env 파일을 만듬 아래와 같이 저장했다면

```env
PORT = 8889
MONGODB_URL = "mongo://localhost:8888/we-tube"
```

아래와 같이 불러내서 사용할 수 있음

```js
import dotenv from "dotenv";
dotenv.config();

const handlePor = (error) => {
  console.log(`listen : ${process.env.PORT}`);
};

app.listen(process.env.PORT, handlePort);
```

이렇게 저장하면 git에 안 올리고 숨길 수 있음

> dotenv environment variables file
> .env  
> .env.test  
> 기본적으로 gitignore 목록 받으면 있긴한데 꼭 확인할 것

-----------------

2021/06

위의코드가 로컬 mongodb에 저장되지 않은 이유는 mongo atlas을 connect했기 때문이였음

그러니까

localhost:PORT/wetube는

wetube란 이름의 저장소를 local mongo에 만들겠다는 이야기임

용량문제나 접근성문제로 빌드할 땐 mongo atlas를 이용하고, 테스트할 때는 local로 사용함


아래는 local bd를 사용법임
<br>
<br>

# mongo DB 결국 다시함,,

mongoDB 홈페이지에서 gui형식으로 연결을 지원하기 때문에, 굳이 mongoose를 쓰지 않아도
연결할 수 있는 거 같다.  
하지만 이미 mongoose 형식으로 schema obj를 작성했기에 Brew를 사용해서 mongooose랑 mongodb를 connect해주도록하자,,

[brew로 mongodb 실행하기](https://zellwk.com/blog/install-mongodb/)

위의 링크를 참조하고 주요 command line은

```


brew services run mongodb-community

brew services stop mongodb-community

help

use dbs

show collections

db.<current dictory>.remove({})

// 만약 연결이 거절되었다면 아래코드를 실행
brew services start mongodb-community 

```

터미널에 mongo라고 치면 긴 로그가 나옴
connection to : mongodb://127.0.0.1:27017/<사이트 주소>
<사이트 주소> <- 이 부분에 적는 단어가 woodtube라면,
데이터를 생성했을 때
show dbs에 나오는 목록 중 woodtube가 생김 ( 그 안에 video, author등등을 저장할거임 )

```
MongoDB shell version v4.4.3
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("a9ec0127-606d-4410-92b5-1b117de324b6") }
MongoDB server version: 4.4.3
```

db를 만들어서 아래와 같이 적어줌  

```
db.js
import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/woodtube", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const handleOpen = () => console.log("🛢  Conneted to DB");
db.on("error", (error) => console.log("🛢 🛢 🛢 DB Error", error));
db.once("open", handleOpen);

```

app.js 혹은 init.js에
import "./db";  를 해줌

<br>
<br>

# multer 아래로 조금 더 내리면 같은 내용이 하나 더 있음!

`npm install multer`

multer는 특정 id를 가지는 input tag를 get, post 요청 처리할 수 있게 도와줌
이게 없으면 데이터를 body에 실어서 보낼 수 없음


```js
// middleware.js
import multer from "multer";

const multerVideoPath = multer({ dest: "uploads/videos/" });
export const uploadVideoPath = multerVideoPath.single("file");
```
```pug
form(action=`/videos${routes.upload}` method="post" enctype="multipart/form-data")
    label(for="file") Video File
    input(type="file" name="file" accept="video/*")
```

```js
// router.js
import {uploadVideoPath} from "../middleWare"

globalRouter.get('/', getUpload)
globalRouter.post('/',uploadVideoPath ,postUpload)
```

<br>
<br>

# mongo broken (static file)

```
localhost:8889/uploads/videos/b445b0db04e10346d5700cc6d9e66104:1 Failed to load resource: the server responded with a status of 404 (Not Found)
```

비디오를 업로드하면 비디오의 경로를 찾을 수 없다고 뜬다.

app.js에 가보면 우리는 라우터를 localhost:8889/videos/uploads 로 지정해 놨기 때문에 경로를 찾지 못하는 건데 이는
file, img를 가져올 때 express에서 static으로 지정해 줘야 해결할 수 있다.

```js
app.use("/uploads", express.static("uploads"));
```
> app.use("./uploads", express.static("uploads"));
> 위와같이 ./uploads 라고 적으면 못 찾는다 ㅠㅠㅠ 시부랄 점하나 뺸다고 세시간 걸렸음
> 나중에 파일은 aws에 보내고 주소만 가져올거임!
> 이런식으로 파일을 가지고 있으면 보안이나, 용량문제로 서버가 다운될 수도 있음!

<br>
<br>

# 문법 확인

```js
const { obj } = hellow;
```

```js
const obj = hellow.obj;
```

둘 다 같은 결과를 도출해 낸다. 위의 문법이 더 좋을듯

<br>
<br>

# mongoose Shema, model 사용해서 데이터베이스 폼 작성하기

Video.js 를 아래와 같이 작성한 다음, init.js에 import "./<path>"를 적는다.

<br>
<br>

### VideoModel


mongoose에서 제공하는 메서드를 이용해 db생성, 찾기, 삭제, 업데이트 등을 할 수 있다.

```
for instance
VideoModel.create()
VideoModel.find()
VideoModel.findById()
VideoModel.findByIdandRemove()
VideoModel.findByIdandUpdate()
```
아래와 같이 video Schema를 작성

복수의 comment는 배열로 내용를 저장하고 내용을 Comment model에서 참조, creator는 한 명이니까 하나의 데이터만 받고 login한 User Model에서 참조

```js
// Video.js

import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const videoSchema = new Schema({
  fileUrl: {
    type: String,
    required: "File URL is required",
  },
  title: {
    type: String,
    required: "Tilte is required",
  },
  description: String,
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
   creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const VideoModel = mongoose.model("Video", videoSchema);
export default VideoModel;
```

<br>
<br>

#### Comment Model

댓글을 작성하는 사람의 아이디는 로그인 한 user id로 User Model에서 참조

```js
// Comment.js

import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  comment: {
    type: String,
    requried: "plz write more than one word",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
   creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
```

<br>
<br>

### User Model

해당 user가 작성한 comments는 Comment Model에서 id에 해당하는 comments를 참조,

해당 user가 업데이트한 video는 Video Model에서 Video id를 참조

```js
// User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatarUrl: String,
  githubId: Number,
  password: Number,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
});

export default UserModel;

```
<br>
<br>

### data model 데이터 모델 작성

데이터 모델을 작성하는 건 정말 어렵고, 실수가 찾으니까 미리 완성된 데이터 모델을 그림으로 그려보고 작성

<br>
<br>

### mongoose.Schema.Types.ObjectId

model을 작성할 때 참조로 쓰이는 정보는 data model을 완성하고 나서 작성하자 모델과 동시에 이것저것 만들면 꼬일 확률이 높다.

참조 스키마를 작성하는 방법은 아래를 예로 설명하겠음

<br>
<br>

# add reference schema 참조 스키마 추가하기

처음 schema를 짤때 오해했던 게 creator type과 refrence가 User Model이라는 사실을 mongoose에 알려줬기 때문에
로그인 상태로 비디오를 업로드하면 당연히 User id가 creator로 자동 참조될 줄 알았는데 **이거 수동으로 넣어줘야 한다**

video를 upload했을 때 로그인 한 해당 유저의 아이디를 creator라는 schema에 넣고
User가 upload한 video를 배열로 받자

```js
// Video.js
// Video Model 의 한 부분

creator: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},

// User.js

videos : [{
  type : mongoose.Schema.Types.ObjectId,
  ref : "Video"
}]
```

passport로 login시 user 객체가 request에 담기는데 이를 아래와 같이 Video creator schema에 넣어준다.

이렇게 하면 video Model은 creator mongoose.Schema.Types.ObjectId, User에 참조함을 알려주게 된다.

<br>

user schema에 배열로 video id를 저장할 땐 아래와 같이 js에서 제공하는 push()메서드를 사용하고,

mongoose에서 제공하는 save()함수로 request에서 변경된 값을 스키마에 저장해준다.

```js
// videoController.js

import VideoModel from "../model/Video";

export const postVideoUpload = async (req, res) => {
  const {
    body :  { title, description, genre },
    file : { path : fileUrl }
  } = req;
  try{
    const newVideo = await VideoModel.create({
      fileUrl
      title,
      description,
      genre,
      creator : req.user._id,
    });
    // User Videos schema에 push(아이디) 해주고 저장해줘야함!!
    req.user.videos.push(newVideo.id);
    req.user.save();
    res.redirect(`/videos${routes.videoDetail(newVideo.id)}`);
  } catch (error) {
    console.log(`postUploadController errer by ${error}`);
  }
  res.redirect(routes.home);
};

```

<br>
<br>

# 로그인 시 메뉴 변경하기

로그인 시 loggedUser라는 로컬 변수를 만들어서 pug에 뿌려주자,

```js
// middelware.js

export const localMiddleWare = (req, res, next) => {
  if (req.user) {
    res.locals.loggedUser = req.user;
  } else {
    res.locals.loggedUser = null;
  }
  next();
};
```
loggedUser = true 로 작성하고 싶었는데 왜인지 적용이 안돼서 아래와 같이 작성했다.

다음번에 (이 글을 본다면) pug에서 조건문을 작성할 경우 typeof로 자료형을 확인하고 pug doc확인해서 작성해보장

```pug
.header__manu
    if loggedUser
        span.header__upload
            a(href=`/videos${routes.upload}`) UPLOAD
        span.header__profile
            a(href=`/users${routes.userDetail(id)}`) PROFILE
        span.header__logout
            a(href=`/users${routes.logout}`) LOG OUT
    else
        span.header__join
            a(href=`/users${routes.join}`) JOIN
        span.header__login
            a(href=`/users${routes.login}`) LOGI IN
```

<br>
<br>

# mixin 으로 video를 home 화면에 뿌려주기 ( async await )

```js
export const home = async (req, res) => {
  try {
    const videoSchema = await VideoSechma.find({});
    res.render("home.pug", { pageTitle: "Home", videoSchema });
  } catch (error) {
    console.log(error);
    res.render("home.pug", { pageTitle: "Home", videoSchema: [] });
  }
};
```

videoShcema를 home.pug 에 보내고 mixin으로 데이터를 훑으면서 화면어 띄움!

```pug
// home.pug
extends layouts/main.pug
include mixin/videoBlock.pug

block content
    .videos
        each video in videoSchema
            +videoBlock({
                id:video.id,
                title:video.title,
                views:video.views,
                videoFile:video.fileUrl
            })
```

```pug
/// mixin.pug
mixin videoBlock(video={})
    .videoBlock
        video.videoBlock__thumbnail(src=video.videoFile, controls="true" )
        a(href=routes.videoDetail(video.id))
            h4.videoBlock__title #{video.title}
        h6.videoblock_views #{video.views}
        p.videoDecription #{video.description}
```

위와 같이 db를 비동기적으로 받아옴

<br>
<br>

# multer 설치하기

`npm install multer` 설치하고

[multer document](https://github.com/expressjs/multer/blob/master/doc/README-ko.md)

요기를 참조해서 동영상 업로드를 해봅시당.

<br>
<br>

# multer로 데이터 경로, 데이터를 받을 양식 작성하기

```js
//midleware.js
import multer from "multer";
const multerVideoPath = multer({ dest: "uploads/" });


export const uploadVideoPath = multerVideoPath.single("file");
```
**/uploads 라고 쓰면 컴퓨터 root에 생성됨, 내가 작업하고 있는 위치에 생성되는게 아님**  

위의 코드를 미들웨어에 적거나 videoRoute.js에 적어도 상관없고, 위와같이 적은 코드를 post upload router에 추가해줌


```js
videoRouter.post(routes.upload, uploadVideoPath, VideoUploadController);
```

위와 같이 path - controller 중간에 삽입해줌

upload.pug에서 아래와 같이 enctype 추가

<br>
<br>

# form 에 enctype 추가하기

```pug
form(action=`/videos${routes.upload}` method="post" enctype="multipart/form-data")
    label(for="file") Video File
    input(type="file" name="file" accept="video/*")
```
‼️‼️ multerVideoPath.single("file")은 name="file"의 파일을 request로 보냄 !!!!

> form의 method가 post일 떄 enctype을 적어줘야함!!!!
> 인코딩을 안 해주면 동영상 업로드를 못함 ㅠㅠㅠㅠ
> mongoose에 파일 자체를 넣는게 아니라 파일의 위치 URL을 저장할건데, URL을 확인하려면 req.file object를 확인해야하고,
> req.file은 업로드할 영상을 인코딩해서 보내야 양식이 작성됨 (이름이나 인코딩,, 위치, 파일 사이즈 이런 것들이 포함된)

|                application/x-www-form-urlencoded                |                                             multipart/form-data                                              |                                       text/plain                                       |
| :-------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: |
| 기본값으로, 모든 문자들은 서버로 보내기 전에 인코딩됨을 명시함. | 모든 문자를 인코딩하지 않음을 명시함.이 방식은 <form> 요소가 파일이나 이미지를 서버로 전송할 때 주로 사용함. | 공백 문자(space)는 "+" 기호로 변환하지만, 나머지 문자는 모두 인코딩되지 않음을 명시함. |

<br>
<br>

# post로 보낸 데이터를 화면에 띄우기위해 controller 작성하기

VideoModel은 데이터를 삽입할 위치로 mongoose에서 제공하는 메서드를 이용함

```js
// contorller.js
import VideoModel from "../models/Video";

export const postUpload = async (req, res) => {
  const {
    body: { title, description },
  } = req;
  const {
    file: { path },
  } = req;
  const newVideo = await VideoModel.create({
    fileUrl: path,
    title,
    description,
  });
  res.redirect(routes.videoDetail(newVideo.id));
};
```

> 가끔 req에 path가 안나오는데 title, decription을 바꾸거나 upload폴더의 데이터를 다 지우면 뜨기도 함 ㅜㅜㅜ 
> 근데 한 번 뜨고나면 또 잘 나옴 내가 뭘 잘못 적었었나 싶은데 골때림

이와 같이 작성하여 VideoModel에 데이터를 추가하고, 추가했다면 다른 라우터에서도 추가한 데이터를 불러올 수 있음

```js
// controller.js
import VideoModel from "../models/Video";

export const home = async (req, res) => {
  try {
    // videoModel = videoSchema임, find대신 findById나 filter를 사용해서
    // 특정 데이터만 불러올 수 있음 나중에 연습해보자
    const videoSchema = await VideoModel.find({});
    res.render("home.pug", { pageTitle: "Home", videoSchema });
  } catch (error) {
    console.log(error);
    res.render("home.pug", { pageTitle: "Home", videoSchema: [] });
  }
};
```
<br>
<br>

# edit video

#### VideoDetail page 에서 가져온 id 를 editPage로 보내주기 줘야 함

```pug
// videoDetail.pug
a(src=routes.edit(videoSchema.id))
```

- videoDetail.pug를 a link를 함수로 만들어 줌

```js
// routes.js

const routes = {
  edit = function(id) {
    if (){
    return `videos/${id}/edit`
    }
  }else{
    return EDIT_VIDEO
  }
}
```

- routes.js 파일에서 routes.edit을 id 인자를 받아서 "videos/<id>/edit"로 갈 수 있도록 조건 문을 작성

#### 라우터를 함수로 변경해 줌(videoDetail a 태그의 변수id를 인자로 받아오도록)

```js
/// router.js
const videoRouter.get(routes.edit(), editController)
```

#### get에서 받아온 id(인자)로 현재 비디오 수정하기

- get method에서 작성해야 함! edit page가 렌더링 될 때 params.id에 id가 저장되어 있기 떄문에! (데이터를 보내는게아님 받아온 걸로 수정하는 거임!)

<<<<<<< HEAD

<br>
<br>

# Delete Video

비디오 지우는 건 간단함, templete에서 아래와 같이 작성함

```pug
a(herf=routes.deleteVideo(videoSchema.id))
```

이렇게 routes.deleteVideo를 함수로 변경하여 id를 a링크를 통해서 전달하고,
전달 받은 아이디를 deleteController에서 req.params.id 로 받음
req.params.id 와 일치하는 schema를 삭제하는 메서드를 호출하고 리다이렉트 to 홈 이동

```js
// controller.js
export const deleteVideo = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    await VideoModel.findByIdAndRemove(id);
    res.redirect(routes.home);
  } catch (error) {
    console.log(error);
    res.redirect(routes.home);
  }
};
```

<br>
<br>

# ESLint

아래 내용대로 일단 실행했고, 이부분은 개편되는 eslint영상을 참조하거나, 디폴트로 보고 따라 하도록하자,
reference : (chapter 4-11 comment)

2021년 1월 6일.
올려주신 여러 댓글들 참조해서 제가 설치한 과정을 종합해보자면..

1. 아래 순서대로 eslint와 prettier플러그인 및 설정, prettier를 설치해주세요.
   npm install eslint -D
   npm install eslint-plugin-prettier -D
   npm install eslint-config-prettier -D
   npm install prettier -D

2. npx eslint --init

3. 이제 질문이 계속 나오는데 아래 순서대로 선택해주세요.

- To check syntax, find problems, and enforce code style
- JavaScript modules (import/export)
- None of these
- No
- Node
- Use a popular
- Airbnb
- Javascript
- Yes

4. 확장프로그램 검색으로 ESlint extension을 설치해주세요.

5. VScode에서 윈도우는 Ctrl +, 맥은 Cmd +, 입력해주세요.

6. 검색창에 actionon을 입력해준 뒤
   Eslint > Code Actions On Save 가 all로 되어있는지 확인해주세요.

7. 그리고 바로 위에 Edit in setting.json을 클릭해 들어가주세요.
   editor.formatOnSave 가 ture로 되있는지 확인해주시고
   editor.codeActionsOnSave는 null로 되어있을텐데
   { "source.fixAll":tre, "source.fixAll.eslint": false} 로 수정해주고 저장해주세요.

8. 왼쪽사이드보시면 .eslintrc.js가 생성되어있을거에요.
   들어가셔서
   env: {
   browser: true,
   es2021: true,
   node: true,
   },
   extends: [
   'airbnb-base', "plugin:prettier/recommended"
   ],
   parserOptions: {
   ecmaVersion: 12,
   sourceType: 'module',
   },
   rules: {
   "prettier/prettier": "off",
   "no-console":"off",
   "spaced-comment":"off",
   "no-else-return":"off"
   },
   };
   이렇게 수정해주고 저장해주세요.

9. VScode의 오른쪽 하단에 빨간 금지아이콘과 함께 ESlint라고 있을거에요.
   눌러서 allow everywhere 으로 설정해주세요.
   그러면 이제 ESlint가 작동하기 시작해요.

이렇게 어째저째 설치하긴 했는데
하지만 내가 뭔짓을 했는지 과정이 다 이해는 안되네요ㅋㅋ
사실 동영상만 봐서는 설치를 어떻게 해야할지 많이 혼란스럽습니다ㅠㅠ
아마도 요부분은 한번 새로 정리할 필요가 있을 것 같아요..

그리고 아마 설정이 니코쌤이랑 조금 다른 것도 있는 것 같아보이는데..
문제가 있는 부분은 다른 분들이 보충 좀 해주시면 좋을 것 같네요ㅠㅠ

<br>
<br>

# searching (regex)

아래와 같이 작성하면 됨 #4.12 searching Videos 참고,
regex는 ㄱㅓㅁ색해서 맞아보기

```js
// Search Video
// searchingBy = 내가 url에 검색한 단어,
// videos = regular expression (option이 정렬이고 조건이 없으므로 내가 적은 단어가 포함되는 걸 모두 검색함)

export const search = async (req, res) => {
  const {
    query: { term: searchingBy },
  } = req;
  let videos = [];
  try {
    videos = await VideoModel.find({
      title: { $regex: searchingBy, $options: "i" },
    });
  } catch (error) {
    console.log(error);
  }
  res.render("search.pug", { pageTitle: "Search", searchingBy, videos });
};
```

<br>
<br>

# webpack

dev:assets = 파일을 지켜봄 (css를 수정할 떄 마다 webpack을 다시 끄고 키지 않기 위해) -w

<br>
<br>

# webpack error

Uncaught ReferenceError: regeneratorRuntime is not defined
이런 에러가 뜰 떄
@babel/polyfill을 다운받아서 작성함,

<br>
<br>

# 2021 youtube clon webpack


`npm i webpack webpack-cli --save-dev`
또는
`npm i webpack webpack-cli -D`

webpack.config.js 만들기

<br>
<br>

### 21-1 

webpack.config.json은 바닐라 자바스크립트로 써야함 


client 폴더 생성 
그 안에 js, css 폴더 생성
js 폴더안 main.js  
css 폴더안 styles.css

<br>
<br>

### 21-2 


__dirname => 전체 파일의 경로  

```js
// webpack.config.js
// /assets, /js 라고 적으면 안됨!
const path = require("path")
console.log(path.resolve(__dirname, "assets", "js")
=> user/Deskcip/projects/woodtube/assets/js


```
npm install -D babel-loader
<br>
mode 추가하기 mond 빼면 터밀에 옵션 나옴  

<br>
<br>

### 21-3 webpack configuration

```js
// app.js

app.use("/static", express.static("assets"));
```

/static/assets/js/main.js 이런 경로를 통해서 데이터를 주고 받을 수 있음  
그래서 html에 script src경로를 아래와 같이 적어줘야함

```pug
// main.pug (base.pug)

script(src="/static/js/main.js")
```

<br>
<br>

### 21-4 scss loader

```scss
// styles.scss

@import "./_variables.scss"
body {
  background-color : $red;
}
```
```scss
// _variable.scss

$red : red;
```

위의 코드를  
client/js/main.js에 import해줌  

```js
// main.js

import "../scss/styles.scss"

alert("hi!")
```


scss -> styles.scss, _variable.scss 만듬  

sass loader   

npm install sass-loader sass webpack --save-dev
npm install --save-dev css-loader
npm install --save-dev style-loader

```js
// webpack.config.js
test : /\.scss/,
use : ["style-loader", "css-loader", "sass-loader"],
```

<br>
<br>

### 21-5 mini css extract plugin

npm install --save-dev mini-css-extract-plugin

```pug
// main.pug (base.pug)
head
  link(rel="stylesheet", href="/static/css/styles.css")
```

<br>
<br>

### 21-6 better developer experience

```js
// webpack.config.js

modules.export = {
watch : true
}

..
...
....

  output : {
  filename : "main.js",
  path : path.resolve(__dirname, "assets".
  clear : true,
   },
```
nodemon.json 파일 생성

```js
// nodemon.json
{
"ignore" : ["webpack.config.js", "src/client/*", "assets/*"],
"exec" : "babe;-node src/init.js"
}
```

<br>

npm run dev:server 실행시 nodemon.json 찾아서 실행   
npm run dev:assets 실행시 webpack.config.js 찾아서 실행    

<br>

```js
// package.json
"script" : {
  "dev" : "nodmon --exec bebel-node src/init.js"
  "assets" : "webpack --config webpack.config.js"
}
```
<br>

package.json의 script를 위의 코드에서 아래와 같이 고쳐줌

<br>

```js
// package.json
"script" : {
  "dev:server" : "nomdemone",
  "dev:assets" : "webpack"
}
```

<br>
<br>


# webpack 전체 코드

```js
// webpack.config.js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  entry: "./source/client/main.js",
  mode: "developemennt",
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};



```

<br>
<br>

```js
// package.jsson
"scripts" : {
  "dev:server" : "nomdemone",
  "dev:assets" : "webpack"
}
```

=======

<br>
<br>

## passport, passport-local-mongoose 주요 method 설명

> mongoose.plugin()

Suppose you have several models in your database and want to add a loadedAt property to each one.  
 Just create a plugin once and apply it to each Schema:

db가 여러 개 있을 경우 ,loadeAt이라는 propert를 각각의 db에 넣을 때 사용할 수 있는 메서드임,

> passport.selializUser()

웹 브라우저의 현제 user에 대해서 어떤 정보를 가질 수 있느냐,
쿠키가 어떤 정보를 가질 수 있느냐(id : 1 이런 정보를 가지고 있는 것들
쿠키에 있는 정보들은 자동으로 백엔드로 옮겨짐(console.log(req)에 나오는 정보들 같은 느낌인듯))
selialize는 filed가 cookie에 포함될 수 있는지 알려주는 역할을 함,

```js
passport.selializUser(function (user, done) {
  done(null, user.id);
});
```

위와 같이 작성하면 브라우져 쿠키에서 id : rrsase123 이런 값만 열어볼 수 있음

passport.deselializUser()

id로 받아온 값을 어떻게 사용자로 전환하는가에 대해서 적음

```js
passport.deserializedUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
```

위의 두 과정을 passport-local-mongoose로 간단하게 작성할 수 있음
(COOKIES에 ID를 담고 -> 그걸로 사용자 정보를 가져오는 과정임)

> passport-local-mongoose

```js
import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  name: {type : String, required : true, unique : true},
  email: {type : String, required : true, unique : true},
  avatarUrl: type : String,
  facebookId: Number,
  githubId: Number,
  location : String,
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const model = mongoose.Model("User", UserSchema);

export default model;
```

- usernameField :  
  specifies the field name that holds the username. Defaults to 'username'.  
  This option can be used  
  if you want to use a different field to hold the username for example "email".
  
- plugin 메서드는 로그인 에러처리 옵션을 제공함

[passport-local-mongoose](https://github.com/saintedlama/passport-local-mongoose) 옵션 참조

> strategy

- 하나의 로그인 하는 방식, 원하는 만큼 사용할 수 있음 (local strategy, github strategy..)

<br>
<br>

# OAUTH 2.0

[생활코딩 OAUTH 설명](https://www.youtube.com/watch?v=PIlP_YX5HK8)
나중에 보고 정리하자

[블로그 oauth](https://velog.io/@undefcat/OAuth-2.0-%EA%B0%84%EB%8B%A8%EC%A0%95%EB%A6%AC)
이것동
[passport login 정리 블로그 ](https://darrengwon.tistory.com/189?category=877507)

<br>
<br>

# passport

브라우져에 쿠키를 설정해주면, 그 쿠키를 통해서 사용자 id를 받고
passport가 브라우저에서 자동으로 쿠키를 가져와서 인증이 완료된 user object를 controller에 넘겨줌

유져 로그인 -> 브라우져 쿠키 생성 -> passport가 쿠키를 가져옴 -> user object(schema)를 controller에 넘겨줌 -> 인증완료 템플릿을 유저 컴퓨터로 전송

<br>
<br>

# passport 시작하기


> 로그인 데이터 베이스 만들어 주기


`npm install passport-local-mongoose` UserSchema에 저장될 passport-local-mongoose와 플러그인(연결시킴)   

이렇게 하면 usernameField에 대한 메서드를 사용할 수 있음 (.changePassword, .setPassword..)

Model folder에 User.js 생성  

> usernameFiled는 유일값을 가짐

```js
// User.js

import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  avataUrl: String,
  facebookId: String,
  githubId: String,
});

// 아래 두 줄 순서 지켜서 적기

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });
const model = mongoose.model("User", UserSchema);


export default model;
```

> 인증기능 구현하기

`npm install passport passport-local`

passprot.js 생성

```js
//passport.js

import passport from "passport";
import UserModel from "./models/User";

passport.use(UserModel.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
  UserModel.findById(id, function (err, user) {
    done(err, user);
  });
});
```

> seriallizeUser, deserializeUser
> cookie에 user.id가 주어지면 그걸로 패스워드를 찾아주는 역할을 함

join으로 받은 아이디 등록하기  
> .create({})으로 만들면 오버라이딩 되서 UserModel({})이렇게 만든 뒤
> passport-local-mongoos에서 제공하는 .register({})를 사용해 mongodb에 user정보, password 저장
> password는 암호화해서 보내니까 따로 적어줘야 함


```js
// controller.js
import UserModel from "../models/User"

export const postJoin = async (req, res) => {
  const {
    body: { id, email, password1, password2 },
  } = req;
  if (password1 !== password2) {
    res.status(400);
    res.render("join.pug", { pageTitle: "Post Join" });
  } else {
    try {
      const user = await UserModel({
        id,
        email,
      });
      await UserModel.register(user, password1);
    } catch (error) {
      console.log(error);
    }
    // To Do: Log user in``
    res.redirect(routes.home);
  }
};
```

init.js에 passport 미들웨어를 만듬
passport 설정 파일을 import해주고  
passport module도 import 해줌 
passport는 아래와 같이 패스포트 - 미들웨어 - 라우터 순으로 작성

```js
import passport from "passport"
import "./passport"

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// MIDDLEWARE
app.use(localMiddleWare);

app.use(routes.home, globalRouter);
app.use(routes.users, userRouter);
app.use(routes.videos, videoRouter);

```
<br>
<br>

# 로그인 유지하기 (7-5)

npm install connect-mongo

session에 id(accessToken)를 가지고 있기 때문에 client에게 로그인 요청을 보내지 않아도,
세션 정보로 user 정보를 불러올 수 있음

```js
import MongoStore from "connect-mongo";

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  })
);
```

위와같이 작성해주면 재시작 시 유지 상태가 됨

<br>
<br>

# logout

passport를 사용할 땐

```js
export const logout = (req, res) => {
  req.logout();
  res.redirect(routes.home);
};
```

이렇게만 해주면 로그아웃 됨

<br>
<br>


# github login (요약 7-7)

npm install passport-github

github에서 myporfile -> settings -> developer setting -> Register a new GitHub App  
으로 들어가서 OAuth를 만듬

hompage URL  
http://localhost:8889/

cakkback URL
http://localhost:8889/auth/github/callback

로 하고

**SECRET, ID 는 .env에 저장해서 불러오자**

```
/// .env
GH_ID ="adadadad"
GH_SECRET = "1123asdasda22"
```

```js
// passport.js

import GithubStrategy from "passport-github";

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GH_ID,
      clientSecret: process.env.GH_SECRET,
      redirect_uri: `http://localhost:8889${routes.githubCallback}`,
    },
    githubLoginCallback
  )
);
```

아래는 passport에서 제공하는 함수로 유저의 데이터를 가져오는 방식을 기술하는 방법임  
routes.githubCallback = "/auth/github/callback"
githubLoginCallback 은 next가 없으니까? 계속 뱅뱅 돌면서 정보를 터미널러 쏴주기만 함
console.log 대신 user를 만들어야하는데 이건 7-8에서!

```js
// userController.js

export const githubLoginCallback = (accessToken, refreshToken, profile, cb) => {
  console.log(accessToken, refreshToken, profile, cb);
};
```

사용자를 보낼 방법을 기술

```js
// userController.js

export const githubLogin = passport.authenticate("github");

export const postGithubLogIn = (req, res) => {
  res.redirect(routes.home);
};
```

```js
// routes.js

const GITHUB ="/auth/github";
const GITHUB_CALLBACK = "/auth/github/callback";

const routes = {
  gitHub : GITHUB,
  gitHubCallback = GITHUB_CALLBACK
}
```

```js
// globalRouter

import passport form "passport"

globalRouter.get(routes.gitHub, githubLogin)

globalRouter.get(
  routes.githubCallback,
  passport.authenticate("github", { failureRedirect: "/login" }),
  postGithubLogIn
);

```

pug에 a tag 추가해주기

```pug
.social-login
    button.social-login--github
        a(href=routes.github)
            span
                i.fab.fa-github
            |Continue with Github
```

사용자가 gihub social link click ->
/auth/github 라우터 실행(사용자를 여기 주소로 보냄), 콜백함수 (passport.authenticate("github")) 실행
passport.js의 passport.use(new GithubSreategy({}))를 이용함
GithubSreategy로 클라이언트 id, secret key,콜백으로 실행할 url까지 지정(사용자가 정보를 보내는데 동의하면 콜백 url로 사용자 정보를 받아옴)
-> 사용자가 정보를 입력 -> 이 콜백으로 정보를 받아 와서 githublogin callback 실행
githublogin은 res.redirect(routes.home)을 보여줌

<br>
<br>

# 7-7 terminal에 나오는 정보

```
ghu_kAYFkXrMTuM52bOTsXI2VlsMg6Cr033bM4Ze ghr_xRzb0D3rvRRAaJIC67fGTL8rC5GLzKswIElPC7FmO3HdgpeVWU3aL53x9rKE2n31fy2axL008BOw {
  id: '73880776',
  displayName: null,
  username: 'peacepiece7',
  profileUrl: 'https://github.com/peacepiece7',
  photos: [ { value: 'https://avatars.githubusercontent.com/u/73880776?v=4' } ],
  provider: 'github',
  _raw: '{"login":"peacepiece7","id":73880776,"node_id":"MDQ6VXNlcjczODgwNzc2","avatar_url":"https://avatars.githubusercontent.com/u/73880776?v=4","gravatar_id":"","url":"https://api.github.com/users/peacepiece7","html_url":"https://github.com/peacepiece7","followers_url":"https://api.github.com/users/peacepiece7/followers","following_url":"https://api.github.com/users/peacepiece7/following{/other_user}","gists_url":"https://api.github.com/users/peacepiece7/gists{/gist_id}","starred_url":"https://api.github.com/users/peacepiece7/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/peacepiece7/subscriptions","organizations_url":"https://api.github.com/users/peacepiece7/orgs","repos_url":"https://api.github.com/users/peacepiece7/repos","events_url":"https://api.github.com/users/peacepiece7/events{/privacy}","received_events_url":"https://api.github.com/users/peacepiece7/received_events","type":"User","site_admin":false,"name":null,"company":null,"blog":"","location":null,"email":null,"hireable":null,"bio":null,"twitter_username":null,"public_repos":6,"public_gists":0,"followers":0,"following":0,"created_at":"2020-11-03T09:34:27Z","updated_at":"2021-04-11T07:08:06Z"}',
  _json: {
    login: 'peacepiece7',
    id: 73880776,
    node_id: 'MDQ6VXNlcjczODgwNzc2',
    avatar_url: 'https://avatars.githubusercontent.com/u/73880776?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/peacepiece7',
    html_url: 'https://github.com/peacepiece7',
    followers_url: 'https://api.github.com/users/peacepiece7/followers',
    following_url: 'https://api.github.com/users/peacepiece7/following{/other_user}',
    gists_url: 'https://api.github.com/users/peacepiece7/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/peacepiece7/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/peacepiece7/subscriptions',
    organizations_url: 'https://api.github.com/users/peacepiece7/orgs',
    repos_url: 'https://api.github.com/users/peacepiece7/repos',
    events_url: 'https://api.github.com/users/peacepiece7/events{/privacy}',
    received_events_url: 'https://api.github.com/users/peacepiece7/received_events',
    type: 'User',
    site_admin: false,
    name: null,
    company: null,
    blog: '',
    location: null,
    email: null,
    hireable: null,
    bio: null,
    twitter_username: null,
    public_repos: 6,
    public_gists: 0,
    followers: 0,
    following: 0,
    created_at: '2020-11-03T09:34:27Z',
    updated_at: '2021-04-11T07:08:06Z'
  }
} [Function: verified]
```

<br>
<br>

# 7-8 github login callback 처리하기

```js
// userController.js
export const githubLoginCallback = async (
  accessToken,
  refreshToken,
  profile,
  cb
) => {
  const {
    _json: { id, avatar_url, name, email },
  } = profile;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.githubId = id;
      user.save();
      return cb(null, user);
    }
    const newUser = await User.create({
      email,
      name,
      githubid: id,
      avatarUrl: avatar_url,
    });
    return cb(null, newUser);
  } catch (error) {
    return cb(error);
  }
};
```

failed to serialize into session 에러는 아래와 같이 코드를 변경해 주면 됨

```js
// passport.js
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
```

> 추가로 github 계정 email이 private일 경우 로그인이 안될 수도 있다고 함 이럴 경우
> 아래와 같이 코드를 작성해 줌

```js
# github 계정의 email 상태가 private, public에 상관없이 JOIN/LOGIN 하는 코드.

# https://remysharp.com/2017/04/24/when-github-email-scope-fails 참고

1. 패키지 설치
- npm install request
- npm install undefsafe

2. 1 에서 설치한 module들을 import
- import request from "request"
- import undefsafe from "undefsafe"

3. userController.js의 githubLoginCallback 함수를 다음과 같이 변경 (github email API 사용)
export const githubLoginCallback = async (accessToken, _, profile, cb) => {
const {
_json: { id, avatar_url, name },
} = profile;

const email = undefsafe(profile, "emails.0.value");
let promise = null;

if (email) {
promise = Promise.resolve(email);
} else {
promise = new Promise((resolve, reject) => {
request(
{
url: "https://api.github.com/user/emails",
json: true,
headers: {
"user-agent": "my user-agent",
authorization: `token ${accessToken}`,
},
},
(error, res, body) => {
if (error) {
return reject(error);
}

resolve(body.find((entry) => entry.primary).email);
}
);
});
}

promise.then(async (email) => {
try {
const user = await User.findOne({ email });

if (user) {
user.githubId = id;
user.save();
return cb(null, user);
} else {
const newUser = await User.create({
email,
name,
githbId: id,
avatarUrl: avatar_url,
});
return cb(null, newUser);
}
} catch (error) {
return cb(error);
}
});
};
```

<br>
<br>

# 7-9 add profile

user.id 가 user.\_id로 변경되었으니까 수정해주자

```pug
a(href=`${routes.userDetail(user._id)}`) Profile

```

localhost:8889/me 라는 라우터를 만들어 주고 이걸 userDetail.pug에 연결해줄 거임!
이렇게하면 routes.userDetail 라우터 (/:id)가 아닌 routes.me로 userDetail.pug 가게 됨

로그인이 되었을 경우, 로그인 정보를 쿠키가 가지고 있기 떄문에
localhost:8889/akkxkasoo1123 이런 아이디로 접속하지 않고 (routes.userDetail="/:id")
localhost:8889/me 이런 라우터로 접속해도 유저 정보를 가져올 수 있음 (routes.me="/me")

userDetail을 작성하고

```pug
extends layouts/main

block content
    .user-profile
        .user-profile__header
            img(src=user.avatarUrl, alt="no image")
            p=user.name
```

아래와 같이 me router를 만듬

```js
// userController.js
export const getMe = (req, res) => {
  res.render("userDetail.pug", { pageTitle: "User Detail", user: req.user });
};
```

```js
// globalRouter.js
globalRouter.get(routes.me, getMe);
```

```js
// routes.js
const ME = "/me";
routes = {
  me: ME,
};
```

> 사진 url이 안 받아질 때
> user schema를 잘 확인 해 봐야 함!

github callback으로 받은 json 정보를 아래와 같이 userSchema에 저장하게되는데

```js
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatarUrl: String,
  facebookId: String,
  githubId: Number,
});
```

사진이 가져와 지지 않을 경우
아래와 같이 versionKey를 추가해야하는 경우가 있고

```js
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    avatarUrl: String,
    facebookId: String,
    githubId: Number,
  },
  { versionKey: false }
);
```

만약 profile_image라는 json 이미지Url이 있고 이걸 받아오고 싶다면  
아래와 같이 prifileImage를 저장할 속성을 만들어 줘야 함!

```js
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatarUrl: String,
  facebookId: String,
  githubId: Number,
  profileImage: Number,
});
```

<br>
<br>

# 7-10 userDetail 부서진 url 고치기

localhost:8889/users/askczo123as  
이런식으로 id를 입력하면 url이 부셔지는데 그걸 고칠 거임

<br>
<br>

# 8-0 ~ 8-1 user profile 수정하기

Edit profile 수정

form enctype과 value=loggedUser.name or email 을 수정해주고

```pug

form(action=`/users${routes.editProfile}`, method="post" enctype="multipform-data")
    .fileUpload
        label(for="avatar") Avatar
        input(type="file" id="avatar" name="avatar" accept="image/*")
    input(type="text" placeholder="Name" name="name", value=loggedUser.name)
    input(type="email" placeholder="Email" name="email", value=loggedUser.email)
    input(type="submit" value="Update Profile")
```

아래와같이 controller 작성

```js
// userController

export const getEditProfile = (req, res) => {
  console.log(req);
  res.render("editProfile.pug", { pageTitle: "editProfile" });
};

export const postEditProfile = async (req, res) => {
  const {
    user: { _id: id },
    body: { name, email },
    file,
  } = req;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      name,
      email,
      avatarUrl: file ? file.path : req.user.avatarUrl,
    });
    res.redirect(routes.me);
  } catch (error) {
    res.render("editProile", { pageTitle: "Edit profile" });
  }
};
```

middleware에 multer를 수정해서 image가 업로드 될 수 있게 폴더를만듬 지금 aws가 없으므로 이렇게 해야 함

```js
// middilewares

const multerAvatar = multer({ dest: "uploads/avatars/" });
export const uploadAvatar = multerAvatar.single("avatar");
```

passport가 deserialize할 때, github정보를 가져오는게아니라 mongodb에 저장된 정보로 user를 업데이트하게 아래와 같이 작성

```js
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
```
> multerAvatar.single("avatar") 여기서 avatar는 input(type="text" name="avatar")를 말하는 것
> 만약 name, email이 변경되지 않는다면 name: name ? name : req.user.name 조건 문으로 작성
> **enctype="multipform-data" 이거 진짜 제발 좀 붙이자 할 떄마다 세 시간씨 날려먹음**

<br>
<br>

# SCSS, JS 를 pug에 적용하기 express.static

app.use("root로 쓸 폴더명", express.static("폴더이름");  
express.static(root, [options])
- options
  - 공식 문서를 보자

```
// SETTING
app.set("views", process.cwd() + "/source/views");
app.set("view engin", "pug");
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
```

<br>
<br>


# 비밀번호 변경하기

[passport-local-mongoose document](https://github.com/saintedlama/passport-local-mongoose)


외부 로그인은 비밀번호 변경을 막으면되고, 로컬 로그인 시  
local mongoose 에서 제공하는 항수로 쉽게 변경할 수 있음
passpword는 함호화 되어 있어서  
asdjzklxc123 이런 식이라  
이런 비밀번호를 확인해주도록 만들거나 기능이 필요함

아래와 같이 작성 하자

```pug
chagePassword.pug
extends layouts/main

block content
    .form-container
        form(action=routes.chagePassword method="post")
            input(type="password" name="oldPassword" placeholder="Current Password")
            input(type="password" name="newPassword" placeholder="New Password")
            input(type="password" name="newPassword1" placeholder="vertify New Password")
            input(type="submit" value="Change Password")
```

```js
// userController.js

export const getChangePassword = (req, res) => {
  res.render("changePassword.pug", { pageTitle: "changePassword" });
};
export const postChangePassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword, newPassword1 },
  } = req;
  try {
    if (newPassword !== newPassword1) {
      res.status(400);
      res.redirect(routes.home);
      return;
    }
    await req.user.changePassword(oldPassword, newPassword);
    res.redirect(routes.me);
  } catch (error) {
    res.status(400);
    res.redirect(routes.home);
  }
};

// userRouter.js

userRouter.get(routes.changePassword, getChangePassword);
userROuter.post(routes.chagePassword, postChangePassword);
```

<br>
<br>

# 8-3 video 만들 때 creator 설정하기

1. video를 로그인 상태만 만들 수 있음
2. video에 있는 creator.id와 loggedUser.id가 같은 경우만 편집가능
3. video에서 login user = creator리면 profile로 이동할 수 있는 버튼 추가

```pug
const commentSchema = new Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
```

creator schema를 comment, video schema에 만들어 줌  
이는 비디오를 업로드 할 때 User shcema에 id를 부여하고 comment, video shcema의 기본키 역할을 함

login user id = req.user.id이고 이는 로그인한 유저가 가지는 고유 아이디임
user id = video.creator.id로 비디오를 제작할 떄 로그인한 유저가 가지고 있던 아이디를 보여줌

아래와 같이 함수를 수정해줌

```js
// videoDetail
export const postUpload = async (req, res) => {
  const {
    body: { title, description },
    file: { path },
  } = req;
  const newVideo = await Video.create({
    fileUrl: path,
    title,
    description,
    creator: req.user.id,
  });
  req.user.videos.push(newVideo.id);
  req.user.save();
  res.redirect(routes.videoDetail(newVideo.id));
};

export const videoDetail = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const video = await Video.findById(id).populate("creator");
    console.log(video);
    res.render("videoDetail", { pageTitle: video.title, video });
  } catch (error) {
    res.redirect(routes.home);
  }
};
```

videoDetial.pug에 다음 줄을 추가해서 로그인 시 editvideo, userDetail로 이동할 수 있게 만듬

```pug
if video.creator.id === loggedUser.id
    a(href=routes.editVideo(video.id))
        button Edit video
.video__author
    |Uploaded by
    a(href=routes.userDetail(video.creator.id))=video.creator.name
```

<br>
<br>

# Video player Setup (아래 주제들은 video player setup을 정리한 것임!)

<br>
<br>

# 여러 파일 webpack으로 출력하기

Video player 관련 설정을 videoPlayer.js폴더에 만들어 주기 위해 우리는 아래와 같이 webpack을 설정해줘여한다. 

기존 entry는  `entry : "./source/client/js/main.js"` 였지만

아래와 같이 entry할 js 파일을 두 개 만들어 준다.

```js
  entry: {
    main: "./source/client/js/main.js",
    videoPlayer: "./source/client/js/videoPlayer.js",
  },
```

출력될 파일 이름을 webpack에서 제공하는 기능 [name]을 사용하여 두 가지를 생성한다. 

[name].js : .js포멧을 가지는 모든 파일을 각각 output한다. 

```js
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
```

그 결과로 아래와 같이 변경된다.

```js
// webpack.config.js

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  entry: {
    main: "./source/client/js/main.js",
    videoPlayer: "./source/client/js/videoPlayer.js",
  },
  mode: "development",
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};

```

<br>
<br>


# videoPlayer.js script 추가하기


script src=main , src=videoPlayer 이렇게 두 가지 여야 하니까,

아래와 같이 block scripts로 바꿔준다.

이때 main.js는 scss에 import 되어 있기 때문에 따로 안 적어도 호출된다.

```pug

// main.pug

...

block scripts
```

```pug

...

block scripts
  script(src="assets/js/videoPlayer.js")
```

<br>
<br>


# videoPlayer.js handel Play & Pause botton

> 문서 참고해서 작성해보고, 안되면 아래 내용을 따라 작성하기
> [HTML Media Element](https://developer.mozilla.org/ko/docs/Web/API/HTMLMediaElement)
> HTML Video Elelemnt는 HTML Media Element의 송성을 상속한다. 들어가보면 자세히 나와 있고
> 문서를 참고해서 속성들을 사용하자
> 문서를 보면 메서드가 read only일 경우 pause() 이렇게 함수로 실행하고,
> read only가 아니라면 mute = true로 실행할 수 있다 (이렇게하면 mute, unmute 메서드를 따로 안 만들어도 됨)


js로 hadling할 태그는 아래와 같이 id를 부여하자

```pug
    .videoDetail
        .videoDetail__video
            video(src=`/${videoInfo.fileUrl}` controls="true")
        div
            button#play Play
            button#mute Mute
            input(type="range" step="0.1" min="0" max="1" value="0.5")#volume
            div
                span#currenTime 00:00:00
                span  / 
                span#totalTime 00:00:00
```

하나의 함수가 하나의 기능을 하도록 니꼬는 만듬

이렇게 함수를 하나의 기능으로 나누면 나중에 코드를 추가, 수정할 때 편함 그리고 만약 수정할 일이 없는 간단한 코드면 같이 쓰는게

더 좋을 수도 있음

```js
// videoPlayer.js

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

// video play & pause button
const hadlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};
const handlePause = () => {
  playBtn.innerText = "play";
};
const handlePlay = () => {
  playBtn.innerText = "pause";
};

// video Mute botton
const hadleMute = () => {};

playBtn.addEventListener("click", hadlePlayClick);
muteBtn.addEventListener("click", hadleMute);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
```

# videoPlayer.js handling Mute & Unmute botton & Muted volumeRange

Mute 버튼을 아래와 같이 작성

mute 상태일때 volume bar의 value = 0, 아닐때 0.5인 함수와, 몇몇 함수들을 삼항 연산자로 몇몇 함수를 간단하게 바꿈

```js
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

// play & pause button
const hadlePlay = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "play" : "pause";
};

// Mute botton
const hadleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? 0 : 0.5;
};

playBtn.addEventListener("click", hadlePlay);
muteBtn.addEventListener("click", hadleMute);
```
<br>
<br>


# video volume

addEvent "input", "change"를 consoel.log로 찍어보면서 볼륨 바의 위치가 변할 떄 어떻게 따라 움직이나 보자

console.log(event.target.value)도 해보자 value는 콘솔에 찍히지 않지만 볼륨이 가지고 있는 기본 값이라 출력이 가능한 듯 하다.

```js
const volumeRange = document.getElementById("volume");

// volume range

const handleVolumeChange = (event) => {
  console.log(event);
};

volumeRange.addEventListener("input", handleVolumeChange);
// volumeRange.addEventListener("change", handleVolumeChange);
```

change는 마우스동작이 끝날 때 발생하고, input은 실시간으로 동작함을 알 수 있다. 

Unmute 버튼을 눌렀을 때 이전 위치를 기억하고 있다가 이전 위치로 바로 이동하도록 만들어 주기위해,

이전 위치를 기억하는 volumnValue를 만들었고 나머지는 아래 보이는 데로 작성하면 됨 (console.log찍어보면서 할 것)

```js
// videoPlayer.js

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

let volumeValue = 0.5;
video.volume = volumeValue;

// play & pause button
const hadlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "play" : "pause";
};

// Mute botton
const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  volumeRange.value = video.muted ? 0 : volumeValue;
};

// volume range
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (value == 0) {
    muteBtn.innerText = "Unmute";
  } else {
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

playBtn.addEventListener("click", hadlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
```
<br>
<br>

# video Duration & Current Time
# + metadata와 MDN을 잘 활용하자

metadata다루는 건 정말 중요한 거 같다.  
아래와 같이 작성해서 메타 데이터를 확인해보자  
```js
// Video Time
const handleCurrentTime = (event) => {
  console.log(event);
};

video.addEventListener("loadedmetadata", handleCurrentTime);
```
video tag의 metadata를 load해주는데 우리가 사용해야할 duration, current time이 모두 적혀있다.

MDN에서 찾아서 사용할 수도 있지만 아래처럼 기능이 생각이 안날 때 아래와 같이 적어서 찾아보는 것도 좋을 거 같다.

```js
> path: (8) [video, div.videoDetail__video, div.videoDetail, main, body, html, document, Window]
returnValue: true
> srcElement: video
accessKey: ""
attributeStyleMap: StylePropertyMap {size: 0}
attributes: NamedNodeMap {0: src, 1: controls, src: src, controls: controls, length: 2}
autocapitalize: ""
autofocus: false
autoplay: false
baseURI: "http://localhost:4004/videos/60a25c3c408e305a5587fba6/detail"
buffered: TimeRanges {length: 1}
childElementCount: 0
childNodes: NodeList []
children: HTMLCollection []
classList: DOMTokenList [value: ""]
className: ""
clientHeight: 171
clientLeft: 0
clientTop: 0
clientWidth: 400
contentEditable: "inherit"
controls: true
controlsList: DOMTokenList [value: ""]
crossOrigin: null
currentSrc: "http://localhost:4004/uploads/videos/da6824832e79cd2e187208dc8c28820a"
currentTime: 18.777007
dataset: DOMStringMap {}
defaultMuted: false
defaultPlaybackRate: 1
dir: ""
disablePictureInPicture: false
disableRemotePlayback: false
draggable: false
duration: 52.167
```
아래 코드를 실행하면 currentTime, totalDuration이 나온다 이 값을 입력해주면 끝
```
// Video Time
const handleCurrentTime = (event) => {
  console.log(event.video.duration);
  cosnole.log(event.video.currentTime)
};

video.addEventListener("loadedmetadata", handleCurrentTime);
```

# Video Time Forammting

컴퓨터는 1970 01 01 09:00 부터 시간을 시작함 그래서 아래와 같은 값을 가질 수 있음, 단위는 ms임

`new Date(0)`   
=> 1970 jan 01 09:00:00 GMT  

<br>

`new Date(29*1000)`  
=> 1970 jan 01 09:00:29  GMT  
to ISO String으로 한국시간을 기준으로 바꿈

<br>

`new Date(29*1000).toISOStrgin()` 
=> 1970 01 01 00:00:29. 

<br>

substr로 원하는 부분 자르기
`new Date(29*1000).toISOStrgin().substr(11,8)` 
=> "00:00:29"

이제 시간을 구할 수 있으니까 아래와 같이 작성해서 동영상 현재 시간과 끝나는 시간을 표시할 수 있다.
```js
// Video Time

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(11, 8);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
};

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
```

# Video Player Time Line

timeline을 표시하기 위해 pug 맨 아래 한 줄을 추가했음

tag의 메타데이터를 보면 속성을 나타내는데 이 대부분이 html, js에서 표기만 다르지 같은 기능을 하고있음 머선 말이냐면

video.constrols = "true"는 video(controls="true)라는 것임 (실제로는 video가 뭔지 선언해야하지만 대충느낌만) 

> video.max는 js에서 처리해 줘야함
> 기본 값은 0s (video.value = 0)
> 비디오의 최소값은 0s (video.min = 0)
> 비디오는 1sec단위로 움직임 (video.step = 1)

이제 아래와 같이 작성해 줄 수 있음
```pug
// videoDetail.pug

extends layouts/main

block contents
    .videoDetail
        .videoDetail__video
            video(src=`/${videoInfo.fileUrl}` controls="true")
        div
            button#play Play
            button#mute Mute
            input(type="range" step="0.1" min="0" max="1" value="0.5")#volume
            div
                span#currenTime 00:00:00
                span  / 
                span#totalTime 00:00:00
            div
                input(type="range" step="1" min="0" value="0")#timeline
```

timeline을 작성해보자

> handleLoadedMetadata에서 timeline.max 속성을 정해주고 (video.duration)
> handleTimeLineChange에서 timeLine.value = video.currentTime 임을 작성하고
> handleTimeUpdate에 timeLine.value를 video.currentTime으로 작성하면, 실시간으로 시간이 업데이트 된다.

```js
const video = document.querySelector("video");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeLine = document.getElementById("timeline");


// Cunrrent Time & Total Time
const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(11, 8);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeLine.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeLine.value = Math.floor(video.currentTime);
};

// Time Line
const handleTimeLineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeLine.addEventListener("input", handleTimeLineChange);
```

# Video Player Full Screen

아래와같이 작성


```js
// videoPlayer.js

const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");

// Full Screen
const handleFullScreen = () => {
  const fullScreen = document.fullscreenElement;
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenBtn.innerText = "Enter Full Screen";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = "Exit Full Screen";
  }
};

fullScreenBtn.addEventListener("click", handleFullScreen);
```

fullScreen은 #videoContainer를 호출하게 작성하자

비디오만 호출하면 컨트롤러가 사라지게 됨

```pug
videoDetail.pug
        div#videoContainer
            video(src=`/${videoInfo.fileUrl}`)
            div
                button#play Play
                button#mute Mute
                input(type="range" step="0.1" min="0" max="1" value="0.5")#volume
                ...
                ...
                ...
```

<br>
<br>

# video player events constrol

마우스가 동영상으로 들어가고 나가면 controllers가 사라지는 기능을 만듬

setTimeOut(), clearTimeOut()으로 video에 마우스가 들어갔다가 나오면 3초뒤 showing class가 사라지는 기능을 먼저 구현함 

setTimeOut()은 비동기 실행시 식별자를 생성하고, 그 식별자를 clearTimeOut으로 보내면 timeOut되는 시간이 초기화 됨

```js
// videoPlayer.js

let controlsTimeOut = null;

const handleMouseMove = () => {
  videoControls.classList.add("showing");
  clearTimeout(controlsTimeOut);
};

const handleMouseLeave = () => {
  controlsTimeOut = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
};

video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
```

비디오 안에서 마우스가 움직일 때 마다 timeOut를 실행, 움직이지 않는다면 clearTime을 실행하게 할 거임


```js
// controls events  (화면에 마우스를 넣었다 뺏을 때 일어나는 이벤트)

let controlsTimeOut = null;


const hideControls = () => {
  if (controlsTimeOut) {
    setTimeout(() => {
      videoControls.classList.remove("showing");
    }, 1000);
  }
};

const handleMouseMove = () => {
  if (controlsTimeOut) {
    clearTimeout(controlsTimeOut);
  }
  videoControls.classList.add("showing");
  controlsTimeOut = setTimeout(() => {
    hideControls();
  }, 1000);
};

const handleMouseLeave = () => {
  controlsTimeOut = setTimeout(() => {
    hideControls();
  }, 1000);
  
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
```

아래처럼 콘솔을 찍어보면 마우스가 움직일 떄 마다 videoMove의 데이터가 생성됨을 알 수 있음

마우스가 움직일 때 마다 setTimeout을 실행하고 setTimeout id를 인자로 clearTimeout(id) 실행함으로
showing class를 계속 유지,

마우스가 멈출 경우 마지막으로 실행한 setTimeout id를 hideControls로 보내고 이벤트가 끝남

```js
const handleMouseMove = () => {
  console.log(videoMove)
  if (controlsTimeOut) {
    clearTimeout(controlsTimeOut);
  }
  videoControls.classList.add("showing");
  controlsTimeOut = setTimeout(() => {
    hideControls();
  }, 1000);
};

const videoMove = video.addEventListener("mousemove", handleMouseMove);
videoMove;
```
<br>
<br>

# 24.0 Register view Controller

템플릿은 프론트엔트, 백엔드는 db, auth 등을 함

지금 하고있는 방식은 SSR임, 대부분 SPR을 한다고 함,
서버와 브라우저간의 통신 방법 : api,
view api : 템플릿을 렌더링 하지 않고, 서버와 통신할 거임 데이터를 주고 받기 위해
view : 템플릿을 렌더링 함


routers/apiRouter.js를 만들어 줌


아래와 같이 작성
```
// apiRouter.js

import express from "express";
import { registerView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id/view", registerView);

export default apiRouter;

```
```js
// videoController
export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await VideoModel.findById(id);
  if (video) {
    video.views = video.views + 1;
    await video.save();
    res.status(200);
  } else {
    res.status(404);
  }
};
```

<br>
<br>

# video view controller, How to set video ID? 

data-[str]=[id]로 아래와 같이 **특정 tag에 id를 부여할 수 있음**
`<article id="ARTICLE", data-super="superArticle", data-love="lovelyArticle"></article>`


데이터를 불러올 땐 


const article = docment.querySelector('#ARTICLE'}
article.dataset.super // "superArticle"
article.dataset.love. // "lovelyArticle"
```

# 적용하기

pug에 dataset을 설정

div#videoContainer(dataset-videoid=videoInfo.id) 

또는 video#videoContainer(...dataset-videoid=videoInfo.id)

둘 다 상관없음 (div가 video tag를 감싸고 있으니까)


```pug
/videoDetail.pug
extends layouts/main

block contents
    .videoDetail
        p=videoInfo._id
        div#videoContainer(data-videoid=videoInfo._id)
            video(src=`/${videoInfo.fileUrl}`)
// ..(이하 생략)
```


video가 끝났을 때 view를 +1할거니까 "ended" 속성을 사용 (media event)

fetch로 post할 데이터 주소를 적음, default가 get이기 때문에 POST로 작성

fetch 주소는 패치될 전체 주소를 보내야함! 헷갈리지말자!

```js
// videoPlayer.js

const videoContainer = document.getElementById("videoContainer");

const handleEnded = () => {
  const id = videoContainer.dataset.videoid;
  fetch(`/api/video/${id}/view`, { method: "POST" });
};

video.addEventListener("ended", handleEnded);
```

apiRouter를 작성하고, 

init.js에 `app.use(/api, apiRouter)` 이렇게 import 하고 작성

```js
// apiRouter.js

import express from "express";
import { registerView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.get("/apis", (req, res) => {
  res.send("hellow!!");
});

apiRouter.post("/video/:id([0-9a-f]{24})/view", registerView);

export default apiRouter;
```

그리고 fetch 됐다는 정보를 서버가 브라우저로 post할때,

`apiRouter.post("/video/:id([0-9a-f]{24})/view", registerView);` registerView가 실행되고,

view + 1이 post로 같이 보내짐

```js
// videoController.js

export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await VideoModel.findById(id);
  if (video) {
    video.views = video.views + 1;
    await video.save();
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};
```

<br>
<br>

# Flash Message 

redirect하지 않고 메시지를 띄워서 사용자에게 메지시를 표시할 거임

`npm install flash-express`

redirect할 때 에러가 났을 때 성공했을 때 등등 사용자에게 보여줄 메시지를 아래처럼 적음

res.localse.error = "Not authrized"랑 거의 같음

```js
// middleware.js
export const publicOnly = (req,res,next) => {
  if (!user.id) {
    return next()
  }else{
    req.flash("error", "Not authorized")
    res.status(400)
    return res.redirect("/")
  
  }

}
```
                           
flash는 messages object에서 호출할 수있다.

아래와 같이 템플릿에 작성

```pug

if messages.error
   span=messages.error

```
                           
로그인 상태에서 주소 창에 localhost:3000/users/login 을 쳐보자

"Not authorized"가 화면에 출력 됨

<br>
<br>
<br>



# 백엔드 구축하기 ( # 17.0 ~ ) 

내가 만든 사이트를 다른 사용자들에게 보여주기 위해서는 몇가지 단계를 거쳐야 한다.

<br>
<br>

## ES6를 vanilla JS로 build하기

지금까지 ES6를 사용하기 위해 babel-node를 사용했다.

babel-node는 작성한 ES6를 실행 즉시 변환 시켜준다.

배포할 때 babel-node를 사용한다면, perfomance가 매우 나쁠 것이기 떄문에 

ES6를 vanilla js로 변환해 줘야 한다. 


[babel cli](https://babeljs.io/docs/en/usage#cli-tool)를 참조하여 아래와 같이 실핼할 수 있다.

```
npm install --save-dev @babel/core @babel/cli

./node_modules/.bin/babel src --out-dir lib
```

이제 아래와 같이 package.json을 작성해 build해보자

```js
// package.json

"scripts" : {
  "dev:build" : "./node_modules/.bin/babel source --out-dir lib"
  "dev:build2" : "babel source -d build"
}
```

위의 두 스크립트는 똑같이 작동하지만 각각 lib, build라는 폴더에 building된다.

### regenerator error

async await을 쓰면 위의 모듈을 import 해줘야함, 이유는 잘 모르겠고 에러가 그렇게 하라고 함..

나중에 생각나면 뭐하는 모듈인지 찾아보자

<br>
<br>
<br>

## front-end build하기 ( assets build하기 )


scripts에 아래 커맨드를 추가 함
```
// package.json
scripts : {
  "dev:assets" : "webpack --mode=development -w",
  "build"assets" : "webpack --mode=production"

}
```

webpack.config에 들어가보면 아래 코드가 있는데 mode 는 --mode, watch는 -w로 스크립트에서 실행할 수 있다

아래  두 줄을 지우고 위에 작성한 스크립트를 차례대로 실행하면서 비교해보자

mode는 webpack을 어떤 용도로 사용할 지를 뜻함

```
// webpack.comfig
  mode: "development",
  watch: true,
```


아래와 같이 스크립트를 합칠 수 있다.
` "build" : "npm run build:server && npm run build:assets", `

그리고 package.json script의 최종 형태

```
package.json

  "scripts": {
    "start" : "node build/init.js",
    "build" : "npm run build:server && npm run build:assets", 
    "build:server": "babel source --out-dir build",
    "build:server-test": "./node_modules/.bin/babel source --out-dir lib",
    "build:assets" : "webpack --mode=production",
    "dev:server": "nodemon",
    "dev:assets": "webpack --mode=development -w"
  },
```

<br>
<br>

# 17.4 ~5 envinorment variables

heroku는 git 을 바라보고 있기 때문에 .gitginore를 읽울 수 없음

`process.env.MONGODB_URL`이나`porcess.env.PORT`같은 환경 변수는 heroku->setting->config varialble에 입력해 줌으로

오류를 고칠 수 있음

용어가 기억이 안 나는데 social login을 구현할 때 받아오는 SECRET KEY, ID 같은 환경 변수도 heroku에 입력해주장

그리고 github api에서 authentification callback URL을 해당 사이트 주소로 변경
```
예를들어
localhost:4000/wetube/api/github/auth/callback
위의 코드를 아래와 같이 변경
https://wetube.heroku.com/api/github/auth/callback
```
# 17.5 github으로 배포하기

github connet하면 됨 ㅎ.. 

git push origin master

-끝-

# 17.6 ~ aws s3 사용하기

aws 계정 생성, storage -> s3 들어가서 create buket

api key를 생성 해서 nodejs와 통신하기 위해 aws의 IAM을 아래와 같이 이용

IAM에 들어가서 USER 게정을 생성함, programtic access key를 활성하 해주면,

aws access key를 발급 받을 수 있는데 이걸 안 하면 매번 aws에 들어가서 로그인을 직접 해야 

(나중에 해보장)

그리고 user에 어디까지 접근 권한을 허용할지  + 그룹에 사용자 추가 기능이 있는데

계정을 하나만 쓸 꺼니까 add user in group 말고 attach exsisting policy deirectly로 

기존 정책 직접 연걸 클릭 -> Amazons3FullAccess을 허용으로하자, 

만약 administrator를 주면 사용자들이 내 계정으로 뭔 짓을 할 지 모르기 때문에 이렇게 필요한 권한만 부여해야 함,

AWS_ID, AWS_SECRET을 받고, 이걸 heroku Reveal conig vars에 입력해줌

npm install --save multer-s3
npm install aws-sdk

아래와 같이 수정

```js
// middleware.js

import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "wetubeeee",
});

const multerAvaterPath = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 10000000,
  },
  storage: multerUploader,
});

const multerVideoPath = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000,
  },
  storage: multerUploader,
});

export const uploadAvatarPath = multerAvaterPath.single("image");

export const uploadVideoPath = multerVideoPath.single("file");
```

# 17-8 object가 aws에 올라가지 않는 에러 수정?

localhost에서 upload해면 데이터는 aws에 올라가지만, localhost에서 가져오질 못함,

aws에 가서 권한 수정 해줌



# express-session ( # 7.13 ~ 7.14 중 )

인증이 필요한 경우만 cookie를 주는게 효울적임

<br>

#### saveUninitialized : false

세션이 만들어지고 수정된 적이 없을 떄 (초기화 되지 않은)

req.session.loggin = true 라고 지정하면 세션이 만들어지고 수정 된 거임, 이때 쿠키가 생성됨

<br>

#### token authentication

session.user를 db에 저장하는 부담이 있을 경우,
ios, android 처럼 cookie를 갖고 있지 않은 경우 token authentication을 사용함

#### secret

쿠키에 하는 사인으로 backend에서 브라우저로 보냈다는 걸 보여주기 위함 
cookie hijack이라는 해킹을 보호하기 위함

#### domain

누가 cookie를 보냈는지를 적음 
localhost -> localhost:~ 로 가는거임
youtube cookie는 youtube로 감

#### expire, Max-Age

사용자가 해당 브라우저에서 나가면 cookie는 사라짐, 


```js
app.use(session({
  secret : "akxcjzid123asdweiredstring"
  resave : false,
  saveUninitialized : false,
  cookie : {
    maxAge : 20000
  }
  

    }
  )
)
```


# 백엔드 구축하기 ( # 17.0 ~ ) 

내가 만든 사이트를 다른 사용자들에게 보여주기 위해서는 몇가지 단계를 거쳐야 한다.

<br>
<br>

## ES6를 vanilla JS로 build하기

지금까지 ES6를 사용하기 위해 babel-node를 사용했다.

babel-node는 작성한 ES6를 실행 즉시 변환 시켜준다.

배포할 때 babel-node를 사용한다면, perfomance가 매우 나쁠 것이기 떄문에 

ES6를 vanilla js로 변환해 줘야 한다. 


[babel cli](https://babeljs.io/docs/en/usage#cli-tool)를 참조하여 아래와 같이 실핼할 수 있다.

```
npm install --save-dev @babel/core @babel/cli

./node_modules/.bin/babel src --out-dir lib
```

이제 아래와 같이 package.json을 작성해 build해보자

```js
// package.json

"scripts" : {
  "dev:build" : "./node_modules/.bin/babel source --out-dir lib"
  "dev:build2" : "babel source -d build"
}
```

위의 두 스크립트는 똑같이 작동하지만 각각 lib, build라는 폴더에 building된다.

### regenerator error

async await을 쓰면 위의 모듈을 import 해줘야함, 이유는 잘 모르겠고 에러가 그렇게 하라고 함..

나중에 생각나면 뭐하는 모듈인지 찾아보자

<br>
<br>
<br>

## front-end build하기 ( assets build하기 )


scripts에 아래 커맨드를 추가 함
```
// package.json
scripts : {
  "dev:assets" : "webpack --mode=development -w",
  "build"assets" : "webpack --mode=production"

}
```

webpack.config에 들어가보면 아래 코드가 있는데 mode 는 --mode, watch는 -w로 스크립트에서 실행할 수 있다

아래  두 줄을 지우고 위에 작성한 스크립트를 차례대로 실행하면서 비교해보자

mode는 webpack을 어떤 용도로 사용할 지를 뜻함

```
// webpack.comfig
  mode: "development",
  watch: true,
```


아래와 같이 스크립트를 합칠 수 있다.
` "build" : "npm run build:server && npm run build:assets", `

그리고 package.json script의 최종 형태

```
package.json

  "scripts": {
    "start" : "node build/init.js",
    "build" : "npm run build:server && npm run build:assets", 
    "build:server": "babel source --out-dir build",
    "build:server-test": "./node_modules/.bin/babel source --out-dir lib",
    "build:assets" : "webpack --mode=production",
    "dev:server": "nodemon",
    "dev:assets": "webpack --mode=development -w"
  },
```

<br>
<br>

# 17.4 ~5 envinorment variables

heroku는 git 을 바라보고 있기 때문에 .gitginore를 읽울 수 없음

`process.env.MONGODB_URL`이나`porcess.env.PORT`같은 환경 변수는 heroku->setting->config varialble에 입력해 줌으로

오류를 고칠 수 있음

용어가 기억이 안 나는데 social login을 구현할 때 받아오는 SECRET KEY, ID 같은 환경 변수도 heroku에 입력해주장

그리고 github api에서 authentification callback URL을 해당 사이트 주소로 변경
```
예를들어
localhost:4000/wetube/api/github/auth/callback
위의 코드를 아래와 같이 변경
https://wetube.heroku.com/api/github/auth/callback
```
# 17.5 github으로 배포하기

github connet하면 됨 ㅎ.. 

git push origin master

-끝-

# 17.6 ~ aws s3 사용하기

aws 계정 생성, storage -> s3 들어가서 create buket

api key를 생성 해서 nodejs와 통신하기 위해 aws의 IAM을 아래와 같이 이용

IAM에 들어가서 USER 게정을 생성함, programtic access key를 활성하 해주면,

aws access key를 발급 받을 수 있는데 이걸 안 하면 매번 aws에 들어가서 로그인을 직접 해야 

(나중에 해보장)

그리고 user에 어디까지 접근 권한을 허용할지  + 그룹에 사용자 추가 기능이 있는데

계정을 하나만 쓸 꺼니까 add user in group 말고 attach exsisting policy deirectly로 

기존 정책 직접 연걸 클릭 -> Amazons3FullAccess을 허용으로하자, 

만약 administrator를 주면 사용자들이 내 계정으로 뭔 짓을 할 지 모르기 때문에 이렇게 필요한 권한만 부여해야 함,

AWS_ID, AWS_SECRET을 받고, 이걸 heroku Reveal conig vars에 입력해줌

npm install --save multer-s3
npm install aws-sdk

아래와 같이 수정

```js
// middleware.js

import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "wetubeeee",
});

const multerAvaterPath = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 10000000,
  },
  storage: multerUploader,
});

const multerVideoPath = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000,
  },
  storage: multerUploader,
});

export const uploadAvatarPath = multerAvaterPath.single("image");

export const uploadVideoPath = multerVideoPath.single("file");
```

# 17-8 object가 aws에 올라가지 않는 에러 수정?

localhost에서 upload해면 데이터는 aws에 올라가지만, localhost에서 가져오질 못함,

aws에 가서 권한 수정 해줌

  # updated 2021 recoder setup (navigator.mediaDevices), ( 이 기능은 지금 이해하기 어렵고, 추가적인 기능으로 필요할 때 구현해 볼 수 있음 )

upload.pug에 video recorder를 만들자,
아래와 같이 video, play button을 추가

```pug
// upload.pug

div
  button#startBtn(type="submit") start recoding
div
  video#preview
```

webpack에 recorder.js 파일을 entry한다,

```js
// webpack.config.js

entry : {
    ...
    ..
    recoder: "./source/client/js/recoder.js",
}

...
..

```

console.log(stream)울 먼저 작성해보고, 아래와 같이 작성한다.

> navigator.mediaDevices.getUserMedia({}) : 미디어 객체를 생성한다.
> video.srcObject : video의 객체 소스로 미디어 객체에 연결해준다.
> video.play() 미디어를 실행한다.

```js
// recoder.js

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

const handleRcordeBtn = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: { width: 500, height: 500 },
  });
  video.srcObject = stream;
  video.play();
};

startBtn.addEventListener("click", handleRcordeBtn);
```


regenerator-runtime에러가 발생하는데 npm install regenerator-runtime을 설치하고

아래와 같이 작성한다.
```js
// main.js

import "regenerator-runtime"
```
```pug
// main.pug

...
..

script(src="main,js")
  block scripts
  
```

이렇게 적어도 된다.

```js
// recoder.js

import regeneratorRuntime from "regenerator-runtime"

...
..
```

<br>
<br>
<br>

# recording button ( media recoder )

recoder.js를 아래와 같이 바꿔서 레코딩 시작, 멈춤 핸들링을 만들고 

innerText도 바꿔준다.

```js
// recoder.js
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    console.log("recording done");
    console.log(e);
    console.log(e.data);
  };
  console.log(recorder);
  recorder.start();
  console.log(recorder);
  setTimeout(() => {
    recorder.stop();
  }, 10000);
};

const handleStop = () => {
  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleStart);
};
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: { width: 500, height: 500 },
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);


```

```js
// recoder.js


```

<br>
<br>
<br>

