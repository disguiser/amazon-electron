export let sendLog;

export function setSendLog(fn) {
  sendLog = fn;
}

export async function doSpider(url) {
  sendLog(`开始执行爬虫...${url}`);
}