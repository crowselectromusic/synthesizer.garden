import fs from 'node:fs'
import path from 'node:path'

const contentDir = path.join(__dirname, '..', '..', 'content')

function collectTagsFromDir(dir: string): Set<string> {
    const tags = new Set<string>()
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            const subTags = collectTagsFromDir(fullPath)
            subTags.forEach((t) => tags.add(t))
        } else if (entry.name.endsWith('.json') && entry.name !== 'company.json') {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
            if (data.tags && Array.isArray(data.tags)) {
                data.tags.forEach((t: string) => tags.add(t))
            }
        }
    }
    return tags
}

function readTagsFromFile(filePath: string): Set<string> {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const tags = data.tags || []
    return new Set(tags)
}

// --- main ---

const args = process.argv.slice(2)
if (args.length < 1) {
    console.error('Usage: tags-diff <tags-file.json>')
    console.error('  Compares tags in the file against tags already in the project.')
    process.exit(1)
}

const filePath = path.resolve(args[0])

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
}

const existingTags = collectTagsFromDir(contentDir)
const newFileTags = readTagsFromFile(filePath)

const existingSorted = [...existingTags].sort()
const newFileSorted = [...newFileTags].sort()

const newOnly = [...newFileTags].filter((t) => !existingTags.has(t)).sort()
const alreadyInProject = [...newFileTags].filter((t) => existingTags.has(t)).sort()

console.log('=== New tags (not yet in the project) ===')
if (newOnly.length === 0) {
    console.log('  (none — all tags already exist)')
} else {
    newOnly.forEach((t) => console.log(`  ${t}`))
}

console.log('')
console.log('=== Already in the project ===')
if (alreadyInProject.length === 0) {
    console.log('  (none)')
} else {
    alreadyInProject.forEach((t) => console.log(`  ${t}`))
}
