# di-web-analytics

### Getting Started

#### Install

🥰 using npm

```bash
npm i di-web-analytics
```

🏺 using yarn

```bash
yarn add di-web-analytics
```
🔥 using CDN
```html
<script>
  (function(a,b,c,d,e){var f={},g=[],h=function(m){return function(){var n={};n['funcName']=m,n['arguments']=arguments,g['push'](n);};},i=['init','setLoggerLevel','autoTrackDom','enterScreenStart','enterScreen','exitScreen','setGlobalConfig','time','track','identify','setUserProfile','viewProduct','search','register','login','logout','destroySession','addToCart','removeFromCart','trackCheckoutProducts','checkout','cancelOrder','returnOrder','notifyUsingCookies','reset'];for(var j=0x0;j<i['length'];j++){f[i[j]]=h(i[j]);}var k=b['createElement'](c),l=b['getElementsByTagName'](c)[0x0];k['async']=0x1,k['src']=d,l['parentNode']['insertBefore'](k,l),a['createDiAnalytics']=function(){return e=arguments,f;},k['onload']=function(){e&&(a['DiAnalytics']['init']['apply'](a['DiAnalytics'],e),g['forEach'](function(m){m['funcName']&&a['DiAnalytics'][m['funcName']]['apply'](a['DiAnalytics'],m['arguments']);}),a['diQueue']=[]);};}(window,document,'script','https://analytics.datainsider.co/static/js/di-web-analytics/0.8.8/index.js'));
  window.DiAnalytics = window.createDiAnalytics(
    {
      host: 'YOUR_API_HOST',
      apiKey: 'YOUR_API_KEY',
    }
  );
</script>
```

#### Init Tracking

```ts
import DiAnalytics from 'di-web-analytics';

DiAnalytics.init(host: string, apiKey: string, properties?: Properties, isDisable?: boolean);
```

+ Example:

```ts
import DiAnalytics from 'di-web-analytics';

DiAnalytics.init('http://dev.datainsider.co', '649623fc-88a8-4cb3-ae45-73cadf659987', {}, false);
```

+ Track data

```ts
import DiAnalytics from 'di-web-analytics';

DiAnalytics.track('login', {name: 'Lina Kunde', age: 24})
```

### Build project with webpack

⚠️ M1 CPU cant run, please run with intel CPU

#### 🛵 Development

```bash
./build_webpack.sh development
```

#### 🏍️ Production

```bash
./build_webpack.sh production
```

### Run test case

+ Unit test

```bash
yarn test
```

+ Automation test

```bash
yarn test:browser
```

#### 🚀 Deploy

```bash
npm publish
```

### License

[MIT @datainsider](./LICENSE)
