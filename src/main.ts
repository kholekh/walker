import walker from "./walker";

const report = require('../public/report.json');

const logger = (value: any) => {
  console.log(JSON.stringify(value, null, 2));
  return value;
}

(async() => {
  const obj = await walker(report, {'item': logger});
})();
