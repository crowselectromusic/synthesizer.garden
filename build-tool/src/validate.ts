import { readFileSync } from 'node:fs'
import { basename, dirname } from 'node:path'
import { type SGCompany, type SGProduct } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonParse(file: string): unknown {
  const raw = readFileSync(file, 'utf-8')
  return JSON.parse(raw) as Record<string, unknown>
}

function missing(product: SGProduct, fields: string[]): string[] {
  return fields.filter((f) => !(f in product) || (product as Record<string, unknown>)[f] === undefined)
}

function missingCompany(company: SGCompany, fields: string[]): string[] {
  return fields.filter((f) => !(f in company) || (company as Record<string, unknown>)[f] === undefined)
}

function missingVideos(videos: unknown[]): string[] {
  const issues: string[] = []
  videos.forEach((v, i) => {
    if (typeof v !== 'object' || v === null) {
      issues.push(`videos[${i}] is not an object`)
      return
    }
    const obj = v as Record<string, unknown>
    for (const key of ['title', 'id', 'type']) {
      if (!(key in obj) || obj[key] === undefined) {
        issues.push(`videos[${i}].${key} is missing`)
      }
    }
    // type must be one of the allowed union members
    const t = obj.type as string | undefined
    if (t && t !== 'youtube' && t !== 'vimeo') {
      issues.push(`videos[${i}].type is "${t}" — expected "youtube" or "vimeo"`)
    }
  })
  return issues
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

const files = process.argv.slice(2)

if (files.length === 0) {
  console.error('Usage: tsx src/validate.ts <path/to/company.json> <path/to/product.json> ...')
  process.exit(1)
}

let total = 0
let passed = 0

for (const file of files) {
  const base = basename(file)
  const json = jsonParse(file)
  total++

  const isCompany = base === 'company.json'
  const issues: string[] = []

  if (isCompany) {
    const company = json as SGCompany
    const required = ['name', 'added', 'link', 'description']
    issues.push(...missingCompany(company, required))
  } else {
    const product = json as SGProduct
    const required = ['name', 'added', 'slug', 'link', 'videos', 'tags', 'description']
    issues.push(...missing(product, required))
    // nested video validation
    const videos = (product as unknown as Record<string, unknown>).videos
    if (Array.isArray(videos)) {
      issues.push(...missingVideos(videos))
    }
  }

  if (issues.length === 0) {
    console.log(`✓ ${file}`)
    passed++
  } else {
    console.error(`✗ ${file}`)
    for (const issue of issues) {
      console.error(`  - ${issue}`)
    }
  }
}

console.log(`${passed}/${total} validated`)

if (passed !== total) {
  process.exit(1)
}
