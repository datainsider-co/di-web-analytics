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

#### Tracking

```ts
import {DiAnalytics} from 'di-web-analytics';

DiAnalytics.init('')
```


### Build project for npm package

```bash
yarn build
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

```bash
yarn test
```

#### 🚀 Deploy

```bash
npm publish
```

