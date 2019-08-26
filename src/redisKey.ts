// flag
export let flag = (key: string) => `flag#${key}`;

// ----------------------------------------------------------------
// 约玩列表
export let inviteList = (userId: string, status: string, pageIndex: number) =>
  `inviteList#${userId}#${status}#${pageIndex}`;
// ----------------------------------------------------------------

export let inviteListOfSomeone = (userId: string) => `inviteList#${userId}#*`;

// 推荐列表
export let recommendList = (city: string, pageIndex: number) =>
  `recommendList#${city}#${pageIndex}`;

// ----------------------------------------------------------------
// 日记
// 用户日记的基本统计信息
export let dailyCount = (userId: string) => `dailycount#${userId}`;

// 用户日记列表
export let dailyList = (userId: string, pageIndex: number) =>
  `daliyList#${userId}#${pageIndex}`;

// ----------------------------------------------------------------
// 用户信息
export let user = (userId: string) => `user#${userId}`;

// 用户约玩价格
export let price = (userId: string, priceName: string) =>
  `price#${userId}#${priceName}`;

// 用户约玩状态
export let inviteStatus = (userId: string) => `inviteStatus#${userId}`;

// ----------------------------------------------------------------
// 关注列表
export let followList = (userId: string, pageIndex: number) =>
  `followList#${userId}#${pageIndex}`;

// ----------------------------------------------------------------
// 收藏列表
export let favList = (userId: string, pageIndex: number) =>
  `favList#${userId}#${pageIndex}`;

// ----------------------------------------------------------------
// 用户签到标记
export let sign = (userId: string, year: number, month: number, date: number) =>
  `sign#${userId}#${year}#${month}#${date}`;
