const { Builder, By, until } = require("selenium-webdriver");
const EntryPage = require("./pages/EntryPage");

async function runSmokeTest() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    const entryPage = new EntryPage(driver);
    await driver.get("http://localhost:5173");

    // 动作：新建日记
    await entryPage.createEntry("自动化UI测试标题", "自动化UI测试内容");

    // 校验：检查列表中是否存在刚才创建的内容
    await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(),'自动化UI测试标题')]"),
      ),
      5000,
    );
    console.log("✅ 冒烟测试成功：核心链路跑通！");
  } finally {
    await driver.quit();
  }
}

runSmokeTest();
