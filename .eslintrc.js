module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 5,
    sourceType: 'script'
  },
  "env": {
    "es6": false,
    "node": true,
    "browser": true,
    "amd": true,
    "commonjs": true,
    "jquery": true,
    "worker": true,
    "mocha": true
  },
  "globals":{
    "seajs":true,
    "jQuery":true,
    "$":true
  },
  // add your custom rules here
  'rules': {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 强制使用一致的缩进
    "indent":[2, 2, {"VariableDeclarator": 1, "SwitchCase": 1}],
    // 要求或禁止使用 Unicode 字节顺序标记
    "unicode-bom": 2,
    // 强制关键字周围空格的一致性
    "keyword-spacing": 2,
    // 要求中缀操作符周围有空格
    "space-infix-ops": 2,
    // 禁止出现多个空格
    "no-multi-spaces": 2,
    // 要求或禁止在一元操作符之前或之后存在空格
    "space-unary-ops": [2, {"words": true, "nonwords": false}],
    // 禁止 function 标识符和应用程序之间有空格
    "no-spaced-func": 2,
    // 要求或禁止语句块之前的空格
    "space-before-blocks": [2, "always"],
    // 强制行的最大长度
    "max-len": [2, 120, { "ignoreComments": true }],
    // 强制或禁止分号
    "semi": [2, "never"],
    // 要求遵循大括号约定
    "curly": 2,
    // 要求使用骆驼拼写法 TODO
    "camelcase": [2, { "properties": "never" }],
    // 要求构造函数首字母大写
    "new-cap": [2, { "capIsNew": false }],
    // 禁用未声明的变量 TODO http://eslint.org/docs/user-guide/configuring#specifying-environments
    "no-undef": 2,
    // 强制在逗号周围使用空格
    "comma-spacing": 2,
    // 逗号风格
    "comma-style": 2,
    // 强制引号风格
    "quotes": [2, "single", {"avoidEscape": true, "allowTemplateLiterals": true}],
    // 操作符、换行符 TODO 目前模块字符串连接问题较多
    "operator-linebreak": [2, "before"],
    // 禁止多行字符串 TODO 目前项目中用的比较多
    "no-multi-str": 0,
    // 要求一致的 This TODO 好像只能设置一个
    "consistent-this": [2, "that", "self", "me"]
  }
}
