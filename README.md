# `mdx.macro`

[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

[![npm version](https://img.shields.io/badge/npm-0.2.5-brightgreen.svg)](https://github.com/weyert/mdx.macro)

A babel-macro for converting mdx into an inline component.

```markdown
## This is some MDX source

<SomeComponent />

~~strikethrough~~
```

```js
import { mdx, imports } from 'mdx.macro'
import { MDXTag } from '@mdx-js/tag'
imports() // copies import statements from markdown file to here

const SomeMDXComponent = mdx('./markdown.md')
```

generates...

```js
const SomeMDXComponent = ({ components, ...props }) => (
  <MDXTag name="wrapper" components={components}>
    <MDXTag name="h2" components={components}>{`This is some MDX source`}</MDXTag>{' '}
    <SomeComponent />{' '}
    <MDXTag name="p" components={components}>
      <MDXTag
        name="del"
        components={components}
        parentName="p"
      >
        {`strikethrough`}
      </MDXTag>
    </MDXTag>
  </MDXTag>
)
```

### Getting started

#### Set up an application

  Recommended setup - set up an application from scratch

  [yarn](https://yarnpkg.com/en/docs/cli/) or [npm](https://docs.npmjs.com/cli/install) can be used

  create a package.json file
  ```
    npm init

    yarn init
  ```

  install webpack and webpack-cli as dev dependencies
  ```
    npm i webpack webpack-cli webpack-dev-server html-webpack-plugin -D

    yarn add webpack webpack-cli webpack-dev-server html-webpack-plugin -D
  ```

  add to package.json
  ```
    "scripts": {
      "start": "webpack-dev-server --mode development --open",
      "build": "webpack --mode production"
    },
  ```

  install and save react and react-dom
  ```
    npm i react react-dom

    yarn add react react-dom
  ```

  install and save the following dev dependencies
  ```
    npm i @babel/core babel-loader @babel/preset-env @babel/preset-react -D

    yarn add @babel/core babel-loader @babel/preset-env @babel/preset-react -D
  ```

  create a [webpack](https://webpack.js.org/guides/getting-started/#using-a-configuration) config. Example of a basic webpack config file:
  ```
    const HtmlWebPackPlugin = require("html-webpack-plugin");

    const htmlPlugin = new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    });

    module.exports = {
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          }
        ]
      },
      plugins: [htmlPlugin]
    };
  ```

  create a .babelrc file and add the following presets
  ```
    {
      "presets": ["@babel/preset-env", "@babel/preset-react"]
    }
  ```

#### Install and save the following dev dependencies
  ```
    npm i @innerfuse/mdx.macro babel-plugin-macros @mdx-js/tag -D

    yarn add @innerfuse/mdx-macro babel-plugin-macros @mdx-js/tag -D
  ```

#### Add [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md) to your babel config file
  ```
    "plugins": [
      "babel-plugin-macros"
    ]
  ```

### Known Problems

If you use a React component which is not defined in the Javascript file and is not imported the application will stop working and you will get an error similar to `__jsxFilename not defined`. If this is the case ensure you have the component referred in the Markdown file is defined.
