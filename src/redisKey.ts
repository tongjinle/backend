import { platform } from "os";

// flag
export let flag = (key: string) => `flag#${key}`;

// accessToken
export let accessToken = (platformName: "qq" | "wx") =>
  `accessToken#${platformName}`;

// freshDiaryList
export let freshDiaryList = (diaryId: string) => `freshDiaryList#${diaryId}`;

// topDiaryList
export let topDiaryList = (diaryId: string) => `topDiaryList#${diaryId}`;

// userDiaryList
export let userDiaryList = (userId: string) => `userDiaryList#${userId}`;

// 用户热度
export let hot = (playerId: string) => `hot#${playerId}`;

// 用户状态
export let isUserFrozen = (userId: string) => `isUserFrozen#${userId}`;
