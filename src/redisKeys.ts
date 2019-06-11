import md5 = require("md5");

const projectName: string = md5("bottle");
export let bottleSet = () => `${projectName}#bottle`;
export let bottleDetail = (id: string) => `${projectName}#bottleDetail#${id}`;
