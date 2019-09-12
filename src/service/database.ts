import { recoverDev } from "./database/recoverDev";
import { recoverProduct } from "./database/recoverProduct";

const RECOVER_DEV = "恢复开发数据";
const RECOVER_PRODUCT = "恢复线上数据";

export async function list(): Promise<string[]> {
  let rst: string[];
  rst = [RECOVER_DEV, RECOVER_PRODUCT];
  return rst;
}

export async function recover(name: string): Promise<void> {
  if (name === RECOVER_DEV) {
    await recoverDev();
  }
  if (name === RECOVER_PRODUCT) {
    await recoverProduct();
  }
}
