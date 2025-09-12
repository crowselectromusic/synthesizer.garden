import directoryTree from 'directory-tree'
import Handlebars from 'handlebars'
import { TomlDate, stringify } from 'smol-toml'
import fs from 'node:fs'
import path from 'node:path'
import { SGCompany, SGProduct } from './types'

const tree = directoryTree('../content', {
    extensions: /\.(json|jpg|jpeg|png|gif)$/
})

const page_template = `
+++

{{{ toml }}}

+++

{{{ description }}}

`

const page = Handlebars.compile(page_template)

function makeProductToml(
    company_slug: string,
    product: SGProduct,
    images: string[]
): string {
    return stringify({
        title: product.name,
        sort_by: 'date',
        date: new TomlDate(product.added),
        slug: product.slug,
        extra: {
            type: 'instrument',
            link: product.link,
            parent: company_slug,
            images: images,
            videos: product.videos
        },
        taxonomies: {
            tags: product.tags
        }
    })
}

function makeCompanyToml(company: SGCompany, slug: string): string {
    return stringify({
        title: company.name,
        sort_by: 'date',
        date: new TomlDate(company.added),
        slug: slug,
        extra: {
            type: 'company',
            link: company.link
        }
    })
}

function generate_index(
    company: SGCompany,
    slug: string,
    directory: string,
    allImages: string[]
) {
    let toml = makeCompanyToml(company, slug)
    let output = page({
        toml,
        description: company.description
    })
    // write out to path

    let outPath = path.join(directory, '_index.md')
    console.log(`writing ${slug} to ${outPath}`)

    try {
        fs.writeFileSync(outPath, output)
    } catch (err) {
        console.error(err)
    }

    // load images??
    const images = ['foo.jpg']

    company.products.forEach((product) => {
        let images = allImages.filter((image) => image.startsWith(product.slug))
        console.log(`images in ${directory}, ${images}`)
        generate_product_page(slug, product, images, directory)
    })
}

function generate_product_page(
    company_slug: string,
    product: SGProduct,
    images: string[],
    directory: string
) {
    let toml = makeProductToml(company_slug, product, images)
    let output = page({
        toml,
        description: product.description
    })
    // write out to path

    let outPath = path.join(directory, `${product.slug}.md`)
    console.log(`writing ${product.slug} to ${outPath}`)

    try {
        fs.writeFileSync(outPath, output)
    } catch (err) {
        console.error(err)
    }
}

console.log(JSON.stringify(tree, null, 2))

tree.children?.forEach((contentDir) => {
    let directory = contentDir.path
    let slug = contentDir.name
    let allImages = (contentDir.children || [])
        .filter((file) => {
            return !file.name.endsWith('json')
        })
        .map((imageObj) => {
            return imageObj.name
        })

    console.log(`all images in direcotry ${allImages}`)

    let dataPath = (contentDir.children || []).filter((file) => {
        return file.name.endsWith('json')
    })[0]?.path
    if (!dataPath) {
        console.log(`No json file found in this directory`)
        return
    }

    console.log(`reading json file ${dataPath}`)

    let dataJson = fs.readFileSync(dataPath, 'utf8')
    let data = JSON.parse(dataJson) as SGCompany

    generate_index(data, slug, directory, allImages)
})
