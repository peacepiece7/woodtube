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
` "build" : "npm run build:server && build:assets", `

그리고 package.json script의 최종 형태

```
package.json

  "scripts": {
    "start" : "node build/init.js",
    "build" : "npm run build:server && build:assets", 
    "build:server": "babel source --out-dir build",
    "build:server-test": "./node_modules/.bin/babel source --out-dir lib",
    "build:assets" : "webpack --mode=production",
    "dev:server": "nodemon",
    "dev:assets": "webpack --mode=development -w"
  },
```



