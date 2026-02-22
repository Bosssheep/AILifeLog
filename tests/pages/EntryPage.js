const { By, until } = require("selenium-webdriver");

class EntryPage {
  constructor(driver) {
    this.driver = driver;
    this.url = "http://localhost:5173";

    // 使用 data-testid 定位元素
    this.titleInput = By.css('[data-testid="title-input"]');
    this.contentInput = By.css('[data-testid="content-input"]');
    this.saveBtn = By.css('[data-testid="save-btn"]');
    this.firstTextArea = By.css('[data-testid="block-textarea-0"]');
  }

  async createEntry(title, content) {
    await this.driver.findElement(this.addBtn).click();
    await this.driver.findElement(this.titleInput).sendKeys(title);
    await this.driver.findElement(this.contentInput).sendKeys(content);
    await this.driver.findElement(this.saveBtn).click();
  }
}

module.exports = EntryPage;
