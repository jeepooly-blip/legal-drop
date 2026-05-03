export interface PiiResult { found: boolean; matches: string[]; redacted: string }

const PHONE_RX = /(\+?962|00962|0)[789]\d{7,8}/g;
const EMAIL_RX   = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}/g
const NATID_RX   = /d{10}/g
const AR_NAME_RX = /(محمد|أحمد|علي|خالد|عمر|يوسف|إبراهيم|عبدالله|سلمى|نور|ريم|ليلى|رانيا)/g

const EN_NAMES = [
  'Mohammed','Ahmad','Ali','Khaled','Omar','Yusuf','Ibrahim',
  'Abdullah','Nour','Reem','Lina','Sana','Hana','Layla','Rania',
  'Fatima','Mona','Khalid','Hassan','Hussein','Mahmoud','Walid',
]

export function checkPii(text: string): PiiResult {
  const matches: string[] = []
  let redacted = text

  const scan = (rx: RegExp, label: string) => {
    const found = text.match(new RegExp(rx.source, 'g'))
    if (found) { matches.push(...found); redacted = redacted.replace(new RegExp(rx.source,'g'), '[' + label + ']') }
  }
  scan(PHONE_RX, 'PHONE')
  scan(EMAIL_RX, 'EMAIL')
  scan(NATID_RX, 'ID')
  scan(AR_NAME_RX, 'NAME')

  EN_NAMES.forEach(name => {
    const rx = new RegExp('\\b' + name + '\\b', 'gi')
    if (rx.test(text)) {
      matches.push(name)
      redacted = redacted.replace(new RegExp('\\b' + name + '\\b', 'gi'), '[NAME]')
    }
  })

return { found: matches.length > 0, matches: Array.from(new Set(matches)), redacted }

