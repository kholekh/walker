import { readFile } from "fs/promises";
import walker, { THandler } from "./walker";

const logger: THandler = (value) => {
  console.log(JSON.stringify(value, null, 2));
  return value;
}

interface ITransaction {
  readonly "VSYMB": string[];
  readonly "items"?: any[];
}

(async() => {

  const addItems: THandler<ITransaction[]> = async (transactions) => {
    try {
      return transactions.reduce((acc, cur) => {
        const [VSYMB] = cur.VSYMB;
        const transaction: ITransaction = VSYMB === '00000603' ? { ...cur, items } : cur;
        return [...acc, transaction];
      }, [] as ITransaction[]);
    } catch (error) {
      console.error(error);
      return transactions;
    }
  }

  const path = process.cwd() + '/public';
  const report = JSON.parse(await readFile(path + '/report.json', 'utf8'));
  const items = JSON.parse(await readFile(path + '/items.json', 'utf8'));
  const obj = await walker(report, {'transaction': [addItems, logger]});
})();
