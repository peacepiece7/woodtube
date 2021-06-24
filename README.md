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

