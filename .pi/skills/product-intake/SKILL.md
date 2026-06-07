---
name: product-intake
description: Automate adding electronic music instruments to synthesizer.garden by scraping product URLs and generating structured JSON files, images, and company metadata. Use when adding new products from manufacturer URLs.
---

# Product Intake Skill: Synthesizer.Garden

**Purpose**: Automate the process of adding new electronic music instruments to synthesizer.garden by scraping product URLs and generating structured data files and images.

**Scope**: Given a product URL from a manufacturer's website, this skill will:
- Fetch and process product information
- Download and optimize product images
- Create or update company information
- Generate properly structured product.json and company.json files
- Validate tags against the approved tags list
- Output files ready for PR submission

---

## Overview

The synthesizer.garden repository organizes music instruments by manufacturer. Each product has:
- A company directory: `/content/{company-slug}/`
- Company metadata: `company.json` (if not exists)
- Product metadata: `product.json`
- Product images: `{product-slug}{N}.jpg` (numbered sequentially)

*Note: Markdown files are auto-generated from JSON by the build-tool, so only JSON and images need to be created.*

### Data Format Reference

**company.json structure**:
```json
{
  "name": "Company Name",
  "added": "2024-06-05",
  "link": "https://company.com/",
  "description": "\n\nCompany description goes here.\n"
}
```

**product.json structure**:
```json
{
  "name": "Product Name",
  "added": "2024-06-05",
  "slug": "product-slug-lowercase",
  "link": "https://company.com/product-page-url",
  "videos": [
    {
      "type": "youtube",
      "id": "YouTubeVideoID",
      "title": "Video Title"
    }
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "description": "\n\nProduct description here.\n"
}
```



### Approved Tags

We should only use tags that already exist. Generate a candidate list of tags based on the product description and specifications, then run `npm run tags-diff` to identify which tags are already in the project and which are new. For any new tags, check if they are synonyms of existing tags and consolidate them accordingly.

Common categories:
- **Instrument types**: `synthesizer`, `sampler`, `drum`, `sequencer`, `mixer`
- **Synthesis types**: `fm`, `granular`, `wavetable`, `additive`, `subtractive`, `physical-modeling`
- **Hardware architectures**: `digital`, `analog` (it can be both)
- **Sound styles**: `ambient`, `drone`, `lo-fi`, `chiptune`
- **Features**: `battery`, `midi`, `cv`, `gate`, `patchable`, `open-source`, `looper`, `effects`, `diy`
- **Platforms**: `arduino`, `raspberry-pi`, `raspberry-pi-pico`, `esp32`, `fpga`

---

## Input Specification

### Product URL Requirements

The skill accepts a manufacturer's product page URL. Supported sources:
- Direct manufacturer product pages (preferred)
- Retailer pages with sufficient product details
- Product review/documentation pages

**Example inputs**:
```
https://bastl-instruments.com/instruments/bestie
https://www.critterandguitari.com/201-pocket-piano
https://www.moffenzeef-modular.com/products/future-ruin
https://www.sonicware.jp/en/products/liven-8bit-warps
```

---

## Workflow

### Phase 1: Information Gathering

1. **Fetch the product page** and extract:
   - Product name (title, h1, or product name field)
   - Product description (main content, specs section)
   - Product images (all product photos from page)
   - URLs to any embedded YouTube videos
   - Technical specifications (features, specs sections)

2. **Extract company information** from:
   - Domain and company name from URL
   - Company website link
   - "About" page or company footer information
   - Contact/company description

3. **Search for YouTube videos**:
   - Look for embedded YouTube links on product page
   - Parse video IDs and titles
   - If multiple videos exist, prioritize official demos/tutorials

### Phase 2: Image Processing

1. **Download all product images** from:
   - Product gallery/carousel
   - Feature images from product description
   - Official product photos (typically 3-6 images)

2. **Optimize images**:
   - Convert to JPEG format (if not already)
   - Resize to maximum 1200px width while maintaining aspect ratio
   - Compress to optimize for web (~100-300KB per image)
   - Maintain high quality (85-90% JPEG quality)

3. **Name images consistently**:
   - Use pattern: `{product-slug}1.jpg`, `{product-slug}2.jpg`, etc.
   - Order images logically (product hero shot first, then detail shots)

### Phase 3: Data Structure Creation

1. **Generate slug** from product name:
   - Lowercase only
   - Remove special characters
   - Use hyphens instead of spaces
   - Examples: `bestie`, `201-pocket-piano`, `kastle`

2. **Generate company slug** if new:
   - Lowercase company name
   - Remove special characters, spaces → hyphens
   - Examples: `bastl`, `critter-and-guitari`, `sonicware`

3. **Extract and validate tags**:
   - Read product description and specs
   - Match against approved tags from `/tags.md`
   - Select 3-8 most relevant tags
   - Prioritize: instrument type (synth, sampler, etc.) + sound style + key features
   - Run `npm run tags-diff` in the `build-tool` subproject with the candidate tags to check for duplicates and new tags
   - If the script reports new tags, verify they are legitimate before proceeding
   - Example tag sets:
     - Portable synth with FM synthesis: `["synthesizer", "fm", "battery"]`
     - Drum machine with sampling: `["drum", "sampler", "digital"]`
     - Effects mixer: `["mixer", "effects", "audio"]`

4. **Create description**:
   - Extract main description from product page (1-3 paragraphs)
   - Preserve original product description where possible
   - Remove marketing fluff, keep technical details
   - Format with proper line breaks and structure

### Phase 4: File Generation

1. **Create/Update company.json** (if company doesn't exist):
   ```
   /content/{company-slug}/company.json
   ```

2. **Create product.json**:
   ```
   /content/{company-slug}/{product-slug}.json
   ```

3. **Create product.md** (TOML frontmatter format):
   ```
   /content/{company-slug}/{product-slug}.md
   ```

4. **Place images**:
   ```
   /content/{company-slug}/{product-slug}{N}.jpg
   ```

---

## Detailed Instructions by Phase

### Phase 1: Information Extraction

**Task**: Scrape the product page and gather all necessary information.

**Steps**:
1. Use web scraper to fetch the product page HTML
2. Parse page structure to find:
   - **Product name**: Usually in `<h1>`, `<title>`, or product header section
   - **Description**: Main product description (often in multiple sections)
   - **Specifications**: Feature lists, tech specs, product info
   - **Images**: All product photography URLs (look for `<img>`, `data-src` for lazy-loaded images)
   - **Videos**: YouTube embeds or video links (parse iframe src or video links)
   - **Company info**: Company name, website, "About Us" text

3. Navigate to company "About" page or footer to gather:
   - Company description
   - Company founding/history
   - Location/contact info

4. Validate extracted data:
   - Ensure product name is clear and accurate
   - Ensure description is comprehensive (minimum 150 characters)
   - Ensure at least 2-3 images are available
   - Verify company information is accessible

**Tools/Methods**:
- HTML parsing (cheerio, beautifulsoup, or similar)
- Headless browser (if page uses JavaScript to load content)
- URL parsing to extract domain/company slug
- Regex for YouTube video ID extraction

**Output**: Structured data object containing all extracted information

---

### Phase 2: Image Processing

**Task**: Download, optimize, and name product images consistently.

**Steps**:
1. Create temporary directory for downloads
2. For each image URL found:
   - Download image file
   - Detect MIME type
   - If not JPEG, convert to JPEG
   - Resize to max 1200px width (preserve aspect ratio)
   - Compress with JPEG quality 85-90%
   - Save as `{product-slug}N.jpg` with sequential numbering

3. Validate processed images:
   - Verify file size is reasonable (100-400KB)
   - Verify dimensions are appropriate
   - Verify format is JPEG
   - Check for corruption or quality issues

4. Copy final images to: `/content/{company-slug}/{product-slug}N.jpg`

**Tools/Methods**:
- `curl` or `wget` for downloading
- `ImageMagick` (`convert`) or `sharp` (Node.js) for processing
- JPEG compression for optimization

**Quality Standards**:
- Minimum resolution: 600px width
- Maximum resolution: 1200px width
- File size per image: 150-300KB ideally
- JPEG quality: 85+ (high quality)

---

### Phase 3: Data Structuring

**Task**: Create properly formatted JSON and metadata.

**Steps for company.json (if new company)**:
1. Extract company name (usually domain-based or explicit)
2. Format current date as YYYY-MM-DD
3. Extract company website URL (verify it's correct)
4. Extract 1-2 paragraph company description from About page
5. Create JSON with proper structure and escaping

**Steps for product.json**:
1. Use today's date for "added" field
2. Generate slug from product name (lowercase, hyphens)
3. Use product page URL for "link" field
4. Parse any YouTube videos (extract ID and title)
5. Match product description to approved tags (min 3, max 8)
6. Extract and format product description (preserve formatting, fix line breaks)
7. Create JSON with proper formatting

**Tag Selection Strategy**:
- **Primary tag** (always include): Instrument type (synthesizer, sampler, drum-machine, sequencer, mixer, etc.)
- **Secondary tags** (1-3): Sound characteristics or synthesis method (fm-synthesis, granular, ambient, drone, etc.)
- **Tertiary tags** (1-3): Features or platform (portable, battery-powered, midi, open-source, etc.)
- **Consolidation**: When the candidate tag file contains tags that are already in the project, **consolidate** them into the existing tag rather than creating a new one. Use the `tags-diff` script output to identify which tags are already in use.
- **Example**:
  ```
  Product: Pocket synth with FM, battery powered, MIDI
  Tags: ["synthesizer", "fm-synthesis", "portable", "battery-powered", "midi"]
  ```

---

### Phase 4: File Output

**Task**: Write all generated files to correct locations.

**Tag consolidation step**:
1. Write candidate tags to a temporary file (e.g., `/tmp/candidate-tags.json`)
2. Run `cd build-tool && npm run tags-diff /tmp/candidate-tags.json`
3. The script prints four sections:
   - Tags already in the project (with count)
   - Tags in the file (with count)
   - **New tags** (not yet in the project) — review these for consolidation
   - Already in the project — these tags are already in use by other products
4. For each new tag, decide:
   - **Consolidate**: If it's a synonym of an existing tag (e.g., `synth` → `synthesizer`, `drum-machine` → `drum`), remove it from the candidate file
   - **Keep as new**: If it genuinely describes a new category not yet captured, add it to the project
   - **Discard**: If it's too generic or doesn't describe the product, remove it
5. After consolidation, write the final product.json with only approved tags

**Checklist**:
- [ ] Company directory exists: `/content/{company-slug}/`
- [ ] company.json written (if new) with proper JSON formatting
- [ ] product.json written with validated structure
- [ ] All images copied to company directory with correct naming
- [ ] All files are readable and have correct permissions
- [ ] No special characters or encoding issues

**Validation**:
1. Run `cd build-tool && npm run validate ${json-file}` on every generated JSON file to confirm valid JSON and all required fields
2. Count image files and verify they match product.json images array
3. Verify all tags are in approved tags list
4. **Run `cd build-tool &&npm run tags-diff ${candidate-tags-file}`** with the candidate tags to identify new tags and existing tags
5. **Consolidate tags**: Merge any new tags that are synonyms of existing tags (e.g., `synth` → `synthesizer`, `drum-machine` → `drum`)
6. Verify URLs are valid (http/https)
7. Verify slug format is correct (lowercase, hyphens, no spaces)

The build-tool validation script (`build-tool/src/validate.ts`) checks:
- **company.json**: `name`, `added`, `link`, `description`
- **product.json**: `name`, `added`, `slug`, `link`, `videos`, `tags`, `description`, and that each video has `type` (`"youtube"` or `"vimeo"`), `id`, and `title`
- If any file fails validation the script exits with code 1, listing all missing fields.

---

## Example Workflow

### Input
```
Product URL: https://sonicware.jp/en/products/liven-8bit-warps
```

### Process
1. **Scrape page** → Extract product info, images, description
2. **Check company** → Create sonicware/company.json (if not exists)
3. **Process images** → Download, optimize, save as liven-8bit-warps1.jpg, liven-8bit-warps2.jpg, etc.
4. **Generate files** →
   - sonicware/company.json
   - sonicware/liven-8bit-warps.json
   - sonicware/liven-8bit-warps*.jpg

### Output Files

**sonicware/company.json**:
```json
{
  "name": "Sonicware",
  "added": "2024-06-05",
  "link": "https://sonicware.jp/",
  "description": "\n\nSonicware is a Japanese music software and hardware company specializing in mobile music production apps and products.\n"
}
```

**sonicware/liven-8bit-warps.json**:
```json
{
  "name": "Liven 8bit Warps",
  "added": "2024-06-05",
  "slug": "liven-8bit-warps",
  "link": "https://sonicware.jp/en/products/liven-8bit-warps",
  "videos": [
    {
      "type": "youtube",
      "id": "dQw4w9WgXcQ",
      "title": "Liven 8bit Warps Demo"
    }
  ],
  "tags": ["mobile-music-creation", "synthesizer", "chiptune", "8-bit"],
  "description": "\n\nLiven 8bit Warps is a pocket synthesizer app featuring 8-bit style sound generation, wavetable synthesis, and various effects. Perfect for chiptune and retro video game music creation.\n"
}
```



---

## Implementation Guidelines

### For AI Agents

When implementing this skill, follow this order:

1. **Initialize**: Parse input URL, validate it's a product page
2. **Scrape**: Fetch and parse HTML, extract all data fields
3. **Validate**: Check that extracted data meets minimum requirements
4. **Company**: Check if company already exists; if not, create company.json
5. **Images**: Download and process all images
6. **Tags**: Match product to approved tags; write candidate tags to `/tmp/candidate-tags.json`
7. **Consolidate**: Run `cd build-tool && npm run tags-diff /tmp/candidate-tags.json` to identify new vs existing tags. Remove synonyms of existing tags from the candidate file.
8. **Generate**: Create product.json with consolidated tags
9. **Output**: Write all files to correct location
10. **Verify**: Run `npm run validate content/{company-slug}/company.json content/{company-slug}/{product-slug}.json` — fix any errors before proceeding

### Error Handling

**Handle these scenarios**:
- **Page not found**: Verify URL is correct, try alternative URLs
- **No images**: Warn but continue; images can be added manually
- **Missing company info**: Use domain as company name, gather from multiple sources
- **Tags not found**: Select closest matching tags, may need manual review
- **JavaScript-heavy pages**: Use headless browser or fetch page after rendering

### Manual Review Checklist

Before submitting generated files for review:
1. Verify product name is accurate and properly spelled
2. Read product description for clarity and accuracy
3. Review images for quality and relevance
4. Check that tags accurately describe the product
5. **Review tags-diff output**: Ensure all new tags are legitimate and not synonyms of existing tags
6. Verify company information is correct
7. Test that markdown renders properly
8. **Validate JSON and required fields**: Run `npm run validate` on every generated file (see `build-tool/src/validate.ts`)

---

## Technical Requirements

### Dependencies
- Web scraper (Node.js cheerio, Python beautifulsoup, or similar)
- Image processor (ImageMagick, sharp, or PIL)
- File system access
- JSON/TOML parsers

### File Permissions
- Generated files should be readable by all users
- Image files should be at least 150x150px

### Constraints
- Product must be currently available for purchase/DIY
- No effects-only devices (must generate own sound)
- No eurorack/modular systems
- No gear from major manufacturers (Yamaha, Korg, Roland, Behringer)

---

## Submission Guidelines

Once files are generated:

1. **Commit message format**:
   ```
   Add [Product Name] by [Company Name]
   
   - Scrapes product details from [URL]
   - Downloads and processes 3-5 product images
   - Generates product.json and company.json
   - Tags selected from approved tags list
   
   Co-authored-by: Product Intake Skill
   ```

2. **PR description should include**:
   - Product name and manufacturer
   - Link to product page
   - Number of images included
   - Tags selected
   - Any manual adjustments made

3. **Files included**:
   - New/updated company.json
   - product.json
   - All product images (*.jpg)

---

## Troubleshooting

### Common Issues

**Issue**: Cannot extract images from page
- Solution: Check if images are lazy-loaded; use headless browser or extract from API
- Alternative: Manual image upload to be added by contributor

**Issue**: Company information is vague
- Solution: Check multiple sources (About page, social media, domain whois)
- Alternative: Use company name from domain, basic info

**Issue**: Product has no YouTube videos
- Solution: This is optional; set videos array to empty array `[]`

**Issue**: Tags don't match any approved tags
- Solution: Find closest matching tags; consider whether product meets repository criteria
- Check: Is this actually an instrument? Is it currently available? Is it from a small maker?

**Issue**: Image quality is poor
- Solution: Find alternative image sources on page
- Try: Check retail listings or media coverage for better images
