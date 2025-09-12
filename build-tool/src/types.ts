export interface SGVideo {
    title: string
    id: string
    type: 'youtube' | 'vimeo'
}

export interface SGProduct {
    name: string
    added: string
    slug: string
    link: string
    videos: SGVideo[]
    tags: string[]
    description: string
}

export interface SGCompany {
    name: string
    added: string
    link: string
    description: string
    products: SGProduct[]
}
