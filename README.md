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
