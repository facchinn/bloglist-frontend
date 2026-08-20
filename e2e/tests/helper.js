const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.locator('input[name="title"]').fill(title)
  await page.locator('input[name="author"]').fill(author)
  await page.locator('input[name="url"]').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByText(title, { exact: false }).waitFor()
}

module.exports = { loginWith, createBlog }
