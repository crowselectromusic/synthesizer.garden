import directoryTree from 'directory-tree'
import Handlebars from 'handlebars'
import { TomlDate, stringify } from 'smol-toml'
import fs from 'node:fs'
import path from 'node:path'
import { SGCompany, SGProduct } from './types'
import elasticlunr from 'elasticlunr'

const tree = directoryTree('../content', {
    extensions: /\.(json|jpg|jpeg|png|webp|gif)$/
})

const page_template = `
+++

{{{ toml }}}

+++

{{{ description }}}

`

const page = Handlebars.compile(page_template)

export const index = elasticlunr<Record<string, string | number>>(function () {
  this.addField("title");
  this.addField("description");
  this.addField("image");
  this.addField("tags");
  this.addField("companyName");
  this.setRef("link");
});

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
        //date: new TomlDate(company.added),
        //slug: slug,
        extra: {
            type: 'company',
            link: company.link
        }
    })
}

function generate_company_page(company: SGCompany, slug: string, directory: string) {
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
}

function generate_index(
    company: SGCompany,
    slug: string,
    directory: string,
    allImages: string[]
) {
    generate_company_page(company, slug, directory)

    // load images??
    const images = ['foo.jpg']

    // add company to seach index
    // skipping for now, since we don't have a good solution for company images
    // index.addDoc({
    //     title: company.name,
    //     description: company.description,
    //     image: "/placeholder.png",
    //     link: `/${slug}`,
    //     tags: "",
    // })
}

function generate_product_page(
    company_slug: string,
    company: SGCompany,
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

    // add to seach index
    index.addDoc({
        title: product.name,
        description: product.description,
        tags: product.tags.join(', '),
        image: `/${company_slug}/${images[0]}`,
        link: `/${company_slug}/${product.slug}/`,
        companyName: company.name
    })

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

    console.log(`all images in directory ${allImages}`)

    const allFiles = contentDir.children || []
    const companyJsonFile = allFiles.find(
        (file) => file.name === 'company.json'
    )

    if (!companyJsonFile || !companyJsonFile.path) {
        console.error(`Company json file not found in directory ${directory}`)
        return
    }

    // New logic: company.json and separate product json files
    console.log(`reading company json file ${companyJsonFile.path}`)
    const companyJson = fs.readFileSync(companyJsonFile.path, 'utf8')
    const companyData = JSON.parse(companyJson) as SGCompany

    generate_company_page(companyData, slug, directory)

    // Now process product files
    const productJsonFiles = allFiles.filter(
        (file) => file.name.endsWith('.json') && file.name !== 'company.json'
    )

    productJsonFiles.forEach((productFile) => {
        if (!productFile.path) return;
        console.log(`reading product json file ${productFile.path}`)
        const productJson = fs.readFileSync(productFile.path, 'utf8')
        const productData = JSON.parse(productJson) as SGProduct
        
        const productImages = allImages.filter((image) =>
            image.startsWith(productData.slug)
        )

        generate_product_page(
            slug,
            companyData,
            productData,
            productImages,
            directory
        )
    })
})

 fs.writeFileSync('../static/search_index.json', JSON.stringify(index));
