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
3. `yarn install` will install dependencies needed to run the build-tools script.
4. `yarn start` will use the data.json files to generate the markdown files zola uses to generate the site
5. go back to the root directory and run:
6. run `zola serve` then visit http://127.0.0.1:1111/

Or use the docker scripts in `./scripts` (warning: these need to be updated to run build-tools first)

## TODO:

- Search is working, but needs theming, and needs to include tags before it can go live.
- A "related gear" box at the bottom of the product page would be amazing. I'm thinking something like using tags, figuring out which are the rarest tags and then picking other gear from those lists at random. It'd re-shuffe each time you compiled the site, but that's kinda neat.
- paginate the index, and taxonomy_single pages, if they have more than ~40 items (a multiple of 4, whatever it is)
