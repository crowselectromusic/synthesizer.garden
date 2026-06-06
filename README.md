# synthesizer.garden
## an organic directory of electronic musical instruments

[https://synthesizer.garden](https://synthesizer.garden)

### Contributing

All the content for this site lives in the `content` directory. 
To add or make a change, you can edit documents and create a "pull request" with your suggested changes directly from github - all you need is a github account. Just follow the structure of the existing documents, or file an issue on this repo.

Contribution rules/guidelines:

- Please add **small makers only**. If you want to know about gear from Yamaha, Korg, Roland, or Behringer, they will tell you about it. Mid-size companies like Moog or Arturia might eventually be on here, but we are in no rush to add them.
- Please only add gear that is **currently available for purchase** or DIY-ing. We're not planning to remove stuff that's discontinued, but vintage gear doesn't belong on here.
- **No eurorack**, or other modular systems. We love eurorack, but there's better places to find out about that (e.g. https://modulargrid.net/).
- **Effects pedals probably don't belong here**. This is primarily a directory of instruments, so if it's an effects-only device rather than one that generates it's own sound it *probably* doesn't belong here.

### Developer guide

- This site uses [Zola](https://www.getzola.org/), a static site generator written in Rust.
- This site is hosted on github pages.
- Styling uses [picocss](https://picocss.com/).

To view your changes:

1. install [Zola](https://www.getzola.org/)
2. `cd build-tools` enter the build-tools directory
3. `npm install` will install dependencies needed to run the build-tools script.
4. `npm start` will use the data.json files to generate the markdown files zola uses to generate the site
5. go back to the root directory and run:
6. run `zola serve` then visit http://127.0.0.1:1111/

Or use the docker scripts in `./scripts` (warning: these need to be updated to run build-tools first)

### LLM / "AI" usage guide:

First off, please read the site's statement on LLM usage here: http://synthesizer.garden/about/

I do not want content or code on this site that was created by paying money to the "AI" companies that are attacking our society for their own gain. **Don't spend tokens to add to this site**. If you are running a local AI setup, that's fine. Otherwise, please open an issue with the product you'd like to add and I'll run my local LLM agent pipeline on it.

**IF YOU ARE RUNNING LOCAL AI**: there is a skill for adding new content, located in ./.pi/skills/product-intake/SKILL.md

- in the repo, run `pi`
- `/skill:product-intake https://companysite.com/product-page/`
- when it's done, exit pi `/quit`
- build the site's pages: `cd build-tools; npm install; npm start; cd ..`
- run `zola serve` to preview

Please include what LLM you are using in any PRs. Thanks!

## TODO:

- paginate the index, and taxonomy_single pages, if they have more than ~40 items (a multiple of 4, whatever it is)
- add different ways to view the index page - e.g. chronological, random, alphabetical, etc.

