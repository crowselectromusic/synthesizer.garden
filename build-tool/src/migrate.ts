import directoryTree from 'directory-tree'
import fs from 'node:fs'
import path from 'node:path'
import { SGCompany, SGProduct } from './types'

// Find all directories in ../content
const tree = directoryTree('../content', {
    extensions: /\.json$/
})

// Loop through each directory
tree.children?.forEach((contentDir) => {
    if (contentDir.children) {
        // Find data.json
        const dataJsonFile = contentDir.children.find(
            (file) => file.name === 'data.json'
        )

        if (dataJsonFile && dataJsonFile.path) {
            console.log(`Processing ${dataJsonFile.path}`)
            const dataJson = fs.readFileSync(dataJsonFile.path, 'utf8')
            const data = JSON.parse(dataJson) as any

            const { products, ...companyData } = data;

            const companyJsonPath = path.join(contentDir.path, 'company.json')
            fs.writeFileSync(companyJsonPath, JSON.stringify(companyData, null, 2))
            console.log(`Wrote ${companyJsonPath}`)


            // Create product files
            products?.forEach((product: any) => {
                let slug = product.slug
                if (!slug) return;
                const productJsonPath = path.join(contentDir.path, `${product.slug}.json`)
                fs.writeFileSync(productJsonPath, JSON.stringify(product, null, 2))
                console.log(`Wrote ${productJsonPath}`)
            })
        }
    }
});

console.log('Migration complete.')
