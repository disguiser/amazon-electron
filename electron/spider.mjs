import puppeteer from 'puppeteer';
import { writeFile, copyFile, stat } from 'fs/promises';
import xlsx from "node-xlsx";
import { getProjectRoot } from './utils.mjs';
import path from 'path';
import { getAmazonHighResImgs } from './spider-img.mjs';

let sendLog;
export function setSendLog(fn) {
  sendLog = fn;
}
/**
 * 执行爬虫
 * @param {string} url 产品页面URL
 */
export async function doSpider(url) {
  // 使用puppeteer获取动态加载的内容
  const { title, description, imgs, others, specification } = await getPuppeteerData(url);
  const nineImgsArr = [...imgs, ...new Array(9 - imgs.length).fill('')]
  // 构建产品数据
  const product = [
    '',
    title,
    description,
    '',
    '',
    specification?.specName,
    specification?.specValue,
    specification? nineImgsArr[0] : '',
    '',
    '',
    '10',
    '10',
    '',
    ...nineImgsArr,
    '',
    '',
    others['Item Weight'] ? others['Item Weight'] : others['Weight'],
    others['L'],
    others['W'],
    others['H'],
    '2',
    '0',
    '',
    '中国大陆',
    '无保修',
    others['Colour'],
    others['Material']
  ];
  sendLog(url);
  // 保存到Excel
  await addInExcel(product);

  sendLog('爬取完成，结果已保存到Excel');
}

/**
 * 使用puppeteer获取需要动态加载的内容
 * @param {string} url 产品页面URL
 */
async function getPuppeteerData(url) {
  sendLog('使用puppeteer获取动态内容...');
  sendLog('启动浏览器...');
  const browser = await puppeteer.launch({
    headless: true, // false表示显示浏览器窗口
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  });
  sendLog('浏览器启动成功');

  try {
    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 1280, height: 800 });
    // 设置用户代理以避免被检测为爬虫
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    // 导航到目标页面
    sendLog('正在加载页面...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

    // 等待页面主要内容加载完成
    await page.waitForSelector('#productTitle', { timeout: 10000 });

    sendLog('页面加载完成，开始滚动页面...');

    // 滚动页面以加载动态内容
    await autoScroll(page);

    sendLog('页面滚动完成，开始提取内容...');

    // 提取产品标题
    const title = await page.$eval('#productTitle', el => el.textContent.trim());

    const description = await getDescription(page);
    if (!description || description.length < 20) {
      description = title;
    }

    const feature = await buildFeature(page);

    const detail = await buildDetail(page);

    // 获取规格
    const specification = await getSpecification(page);
    
    const imgs = await getAmazonHighResImgs(page);

    const others = { ...feature, ...detail };
    
    return {
      title: title.length > 180 ? title.substring(0, 180): title,
      description,
      imgs,
      others,
      specification
    };

  } catch (error) {
    console.error(error);
    sendLog('puppeteer爬取过程中出错');
  } finally {
    await browser.close();
    sendLog('puppeteer浏览器已关闭');
  }
}

/**
 * 自动滚动页面以加载动态内容
 * @param {Page} page Puppeteer页面对象
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // 如果已经滚动到底部或滚动了足够多的距离，则停止
        if (totalHeight >= scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // 等待一段时间，确保动态内容加载完成
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function getDescription(page) {
  const aboutThisItem = await page.$('#feature-bullets')
  if (aboutThisItem) {
    return await aboutThisItem.$eval('ul', el => el.innerText);
  }
  return '';
}

function rebuildKeyValue(keys, values) {
  const res = {}
  for (let i = 0; i < keys.length; i ++) {
    if (['Item dimensions L x W x H', 'Product dimensions', 'Package Dimensions'].includes(keys[i])) {
      if (values[i].includes(';')) {
        const temp = removeInvisible(values[i]).split(';');
        const size = temp[0].split(' ');
        res['L'] = parseFloat(size[0]).toFixed();
        res['W'] = parseFloat(size[2]).toFixed();
        res['H'] = parseFloat(size[4]).toFixed();
        res['Weight'] = dealWeight(temp[1].trim());
      }
    }
    if (/item weight/i.test(keys[i])) {
      res['Item Weight'] = dealWeight(values[i]);
    }
    if (keys[i] == 'Material' || keys[i] == 'Colour') {
      res[keys[i]] = values[i]
    }
  }
  return res;
}

function dealWeight(weightStr) {
  weightStr = removeInvisible(weightStr); 
  if (/ Grams$| g$/.test(weightStr)) {
    return parseInt(weightStr.replace(/ Grams| g/, ''))/1000
  } else if (/ Kilograms| kg$/.test(weightStr)) {
    return parseInt(weightStr.replace(/ Kilograms| kg/, ''))
  } else {
    sendLog('不存在的重量单位: ', weightStr);
    return ''
  }
}

async function buildDetail(page) {
  let detailKeys = [];
  let detailValues = [];
  const techDetail = await page.$('#productDetails_techSpec_section_1');
  if (techDetail) {
    detailKeys = await techDetail.$$eval('.prodDetSectionEntry', el => el.map(e => e.innerText.trim()));
    detailValues = await techDetail.$$eval('.prodDetAttrValue', el => el.map(e => e.innerText.trim()));
  }
  const productDetail = await page.$('#detailBulletsWrapper_feature_div');
  if (productDetail) {
    const productDetailKV = await productDetail.$$eval('.a-list-item', el => el.map(e => e.innerText));
    productDetailKV.forEach(e => {
      if (e.includes(':')) {
        const [key, value] = e.split(':');
        detailKeys.push(removeInvisible(key).trim());
        detailValues.push(removeInvisible(value).trim());
      }
    })
  }
  return rebuildKeyValue(detailKeys, detailValues);
}

async function buildFeature(page) {
  const featureDiv = await page.$('#productOverview_feature_div');
  if (featureDiv) {
    const { keys, values } = await page.evaluate(div => {
      const featureKeys = Array.from(div.querySelectorAll('.a-text-bold')).map(el => el.textContent.trim());
      const featureValues = Array.from(div.querySelectorAll('.po-break-word')).map(el => el.textContent.trim());
      return { keys: featureKeys, values: featureValues };
    }, featureDiv)
    return rebuildKeyValue(keys, values);
  } else {
    return null;
  }
}

/**
 * 获取规格
 * @param {Page} page Puppeteer页面对象
 */
async function getSpecification(page) {
  const specificationContainer = await page.$('.inline-twister-dim-title-value-truncate-expanded')
  if (specificationContainer) {
    const temp = await specificationContainer.evaluate(el => el.innerText)
    const _temp = temp.split(':');
    const specName = _temp[0].trim();
    const specValue= _temp[1].trim();
    return {
      specName,
      specValue
    }
  } else {
    return null;
  }
}

/**
 * 将产品数据添加到Excel文件
 * @param {Array} product 产品数据数组
 */
async function addInExcel(product) {
  const templateFilePath = './template.xlsx';
  const outputFilePath = path.join(getProjectRoot(), 'output.xlsx');
  try {
    await stat(outputFilePath);
  } catch (error) {
    sendLog('输出文件不存在，创建新文件');
    await copyFile(templateFilePath, outputFilePath);
  }
  const workSheetsFromFile = xlsx.parse(outputFilePath);

  workSheetsFromFile[0].data.push(product);

  const buffer = xlsx.build(workSheetsFromFile);
  await writeFile(outputFilePath, buffer);
  sendLog('Excel处理完成');
}

function removeInvisible(str) {
  // 肉眼不可见的字符确实是网页抓取中常见的陷阱，尤其是在处理从 HTML 复制或提取的文本时。
  return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]+/g, '');
}
