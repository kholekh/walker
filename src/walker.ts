export type THandler = <V = any>(value: V, key?: string, obj?: unknown, ...args: any[]) => Promise<V> | V;
export interface IHandlers {
  readonly [key: string]: THandler;
}

const walker = async (obj: unknown, handlers?: IHandlers) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  await Promise.all(Object.entries(obj).map(async ([key, value]) => {
    try {
      const handler = handlers && typeof handlers === 'object' && handlers[key];
      const _value = handler ? await handler(value, key, obj) : value;

      obj[key] = await walker(_value, handlers);
    } catch (error) {
      console.error(error);
      obj[key] = value;
    }
  }));

  return obj;
}

export default walker;