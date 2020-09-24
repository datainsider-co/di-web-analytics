### ❤️ mini-json

🏆 Mini tool for json parser with typescript

![GitHub](https://img.shields.io/github/license/tvc12/mini-json?style=flat-square)

### 😍 Getting started

#### 🛠 Install

```bash
npm install mini-json
- or -
yarn add mini-json
```

#### ✈ Usage

+ 📥 Object to json:

```js
import MiniJson from 'mini-json';
const data = {
  success: true,
  data: {
    dayOfBirthday: '19/07/2020',
    name: 'mini-json'
  }
};
console.log(MiniJson.toJson(data));
/*
{
  "success": true,
  "data": {
    "day_of_birthday": "19/07/2020",
    "name": "mini-json"
  }
}
*/
```

+ 📤 Json to object:

```js
import MiniJson from 'mini-json';
const json = `{
  "success": true,
  "data": {
    "day_of_birthday": "19/07/2020",
    "name": "mini-json"
  }
}`;
console.log(MiniJson.fromJson(json));
/*
{
  success: true,
  data: {
    dayOfBirthday: '19/07/2020',
    name: 'mini-json'
  }
}
*/
```

### ⚙ Config

⚠ Default naming conventions of mini-json:

  + toJson: **camelCase** to **snakeCase**
  + fromJson: **snakeCase** to **camelCase**

🌍 Global config for naming conventions

```js

import MiniJson from 'mini-json';
import {camelCase, kebabCase} from 'lodash';

// toJson use camelCase naming convention
MiniJson.serializeKeysTo(camelCase);

// fromJson use kebabCase naming convention
MiniJson.deserializeKeysFrom(kebabCase);
```

⚓ Specify naming convention

```js
import { kebabCase, camelCase } from 'lodash';

// fromJson use kebabCase naming convention
const student = MiniJson.fromJson<Student>(json, kebabCase);

// toJson use camelCase naming convention
const json = MiniJson.toJson(obj, camelCase);
```

### 👶 Author

[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/0)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/0)[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/1)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/1)[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/2)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/2)[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/3)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/3)[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/4)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/4)[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/5)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/5)[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/6)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/6)[![](https://sourcerer.io/fame/tvc12/tvc12/mini-json/images/7)](https://sourcerer.io/fame/tvc12/tvc12/mini-json/links/7)

### License

[MIT](LICENSE)
