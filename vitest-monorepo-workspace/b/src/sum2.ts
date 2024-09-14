export const sum = async (a: number, b: number) => {
  await sleep(500);
  return a + b
}

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}