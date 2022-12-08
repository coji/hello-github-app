import jwt from 'jsonwebtoken'
import fs from 'node:fs/promises'
import dayjs from 'dayjs'
import dotenv from 'dotenv'
dotenv.config()

/**
 * JWT を生成する
 * @param payload
 * @returns
 */
const buildToken = async (payload: object) => {
  const cert = await fs.readFile('./config/secret-key.pem', 'utf8')
  return jwt.sign(payload, cert, { algorithm: 'RS256' })
}

/**
 * アクセストークンを取得する
 */
const main = async () => {
  const payload = {
    iat: dayjs().unix() - 10, // ちょっと前にすると無効になりにくいらしい。
    exp: dayjs().add(10, 'minutes').unix(), // 10分間だけ有効
    iss: process.env.APP_ID,
  }

  const ret = await fetch(
    `https://api.github.com/app/installations/${process.env.INSTALLATION_ID}/access_tokens`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${await buildToken(payload)}`,
        Accept: 'application/vnd.github.machine-man-preview+json',
      },
    },
  )

  console.log(await ret.json())
}
main()
