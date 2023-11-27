export type THandler<V = any> = (value: V) => Promise<V> | V;

export interface IHandlers {
  readonly [key: string]: THandler[];
}

export const runHandlers = async (value: any, handlers: THandler[]) => {
  const [handler, ...rest] = handlers;
  if (!handler) return value;

  const _value = await runHandlers(
    await handler(value),
    rest,
  );

  return _value;
}

export const walker = async (obj: unknown, handlers?: IHandlers) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  await Promise.all(Object.entries(obj).map(async ([key, value]) => {
    try {
      const keyHandlers = handlers && typeof handlers === 'object' && handlers[key];
      const _value = keyHandlers ? await runHandlers(value, keyHandlers) : value;

      obj[key] = await walker(_value, handlers);
    } catch (error) {
      console.error(error);
      obj[key] = value;
    }
  }));

  return obj;
}

export const walkerV2 = async (obj: unknown, handlers?: IHandlers) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  const entries = Object.entries(obj);
  for (const [key, value] of entries) {
    try {
      const keyHandlers = handlers && typeof handlers === 'object' && handlers[key];
      const _value = keyHandlers ? await runHandlers(value, keyHandlers) : value;

      obj[key] = await walkerV2(_value, handlers);
    } catch (error) {
      console.error(error);
      obj[key] = value;
    }
  }

  return obj;
}
