import { readFile } from "fs/promises";
import { walker, THandler, walkerV2 } from "./walker";

const logger: THandler = (value) => {
  console.log(JSON.stringify(value, null, 2));
  return value;
}

interface IMerchant {
  readonly name: [string];
  readonly branches: [{ readonly branch: IBranch[]}];
}

interface IBranch {
  readonly name: [string];
  readonly terminals: [{ readonly terminal: ITerminal[] }];
}

interface ITerminal {
  readonly IDs: [{ readonly primaryID: [string] }];
  readonly name: [string];
  readonly transactions: [{ readonly reportingDay: IReportingDay[] }];
}

interface IReportingDay {
  readonly $: {readonly day: string};
  readonly transaction: ITransaction[];
}

interface ITransaction {
  readonly "CARD": [string];
  readonly "NUISOM": [string];
  readonly "DTOPEA": [string];
  readonly "VSYMB": [string];
  readonly items?: [{ readonly item: IItem[] }];
}

interface IItem {
  readonly title: [string];
  readonly code: [string];
  readonly amount: [string];
}

(async() => {
  const text = [];

  const handleMerchant: THandler<[IMerchant]> = ([merchant]) => {
    const [name] = merchant.name;
    text.push(name);

    return [merchant];
  }

  const handleBranch: THandler<IBranch[]> = (branches) => {
    branches.forEach(({name}) => text.push(`\t` + name));

    return branches;
  }

  const handleTerminal: THandler<ITerminal[]> = (terminals) => {
    terminals.forEach(({name}) => text.push(`\t\t` + name));

    return terminals;
  }

  const handleName: THandler<[string]> = ([name]) => {
    text.push(name);
    return [name];
  }

  const handleTitle: THandler<[string]> = ([title]) => {
    text.push(title);
    return [title];
  }

  const handleVSYMB: THandler<[string]> = ([VSYMB]) => {
    text.push(VSYMB);
    return [VSYMB];
  }

  const addItems: THandler<ITransaction[]> = async (transactions) => {
    try {
      return transactions.reduce((acc, cur) => {
        const [VSYMB] = cur.VSYMB;
        const transaction: ITransaction = VSYMB === '30000593' ? { ...cur, items } : cur;
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
  const obj = await walker(report, {
    'name': [handleName],
    'title': [handleTitle],
    'VSYMB': [handleVSYMB],
    // 'merchant': [handleMerchant],
    // 'branch': [handleBranch],
    // 'terminal': [handleTerminal],
    'transaction': [addItems],
  });

  console.log(text.join('\n'));
})();
