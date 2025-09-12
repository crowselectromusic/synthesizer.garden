import directoryTree from 'directory-tree'
import { TomlDate, parse } from 'smol-toml'
import fs from 'node:fs'
import path from 'node:path'
import { SGCompany, SGProduct, SGVideo } from './types'

// {
//   "path": "../content",
//   "name": "content",
//   "children": [
//     {
//       "path": "../content/analogsweden",
//       "name": "analogsweden",
//       "children": [
//         {
//           "path": "../content/analogsweden/crum21.jpg",
//           "name": "crum21.jpg"

const tree = directoryTree('../content', { extensions: /\.(md)$/ })

console.log(JSON.stringify(tree, null, 2))

function separateToml(data: string) {
    let tomlStart = data.indexOf('+++')
    let tomlEnd = data.lastIndexOf('+++')
    let tomlData = data.substring(tomlStart + 3, tomlEnd)
    let description = data.substring(tomlEnd + 3)
    let toml = parse(tomlData)
    return { description, toml }
}

tree.children?.forEach((contentDir) => {
    let outData: SGCompany = {
        name: '',
        products: [],
        added: '',
        link: '',
        description: ''
    }

    if (!contentDir.children?.length) {
        console.log(`skipping empty child ${contentDir.name}`)
        return
    }

    contentDir.children?.forEach((file) => {
        let rawData = fs.readFileSync(file.path, 'utf8')
        let data = separateToml(rawData)

        console.log(`processing file ${file.path}`)

        if (file.name == '_index.md') {
            outData.name = data.toml.title.toString()
            outData.added = (data.toml.date as TomlDate).toISOString()
            outData.link = (data.toml.extra.valueOf() as any).link.toString()
            outData.description = data.description
        } else {
            let product: SGProduct = {
                name: data.toml.title.toString(),
                added: (data.toml.date as TomlDate).toISOString(),
                slug: data.toml.slug.toString(),
                link: (data.toml.extra.valueOf() as any).link.toString(),
                videos: [],
                tags: (
                    data.toml.taxonomies.valueOf() as any
                ).tags.valueOf() as Array<string>,
                description: data.description
            }

            if (data.toml.embed_yt && data.toml.embed_title) {
                let vid: SGVideo = {
                    title: data.toml.embed_title.toString(),
                    id: data.toml.embed_ty.toString(),
                    type: 'youtube'
                }

                product.videos.push(vid)
            }

            outData.products.push(product)
        }
    })

    console.log(
        `writing ${contentDir.name} with ${outData.products.length} products`
    )

    let dataPath = path.join(contentDir.path, 'data.json')
    fs.writeFileSync(dataPath, JSON.stringify(outData, null, 2))
})
