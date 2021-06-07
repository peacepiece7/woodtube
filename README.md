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


