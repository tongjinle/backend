// 勋章
// todo

// 勋章
export type Medal = {
  name: string;
  url: string;
  desc: string;
  // 有的勋章有个数
  count?: number;
};

// 是不是已经获得了某个勋章

// 获取勋章
export async function add(userId: string, medalName: string): Promise<void> {}
// 所有勋章
