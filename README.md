# synthesizer.garden
## an organic directory of electronic musical instruments

[https://synthesizer.garden](https://synthesizer.garden)

### Contributing

All the content for this site lives in the `content` directory. 
To add or make a change, you can edit documents and create a "pull request" with your suggested changes directly from github - all you need is a github account. Just follow the structure of the existing documents.

### Developer guide

This site is written in typescript.

- Search is done using [lunr.js](https://lunrjs.com/guides/getting_started.html).
- Styling uses [picocss](https://picocss.com/).
- Page rendering is done using alpinejs
- index.ts generates data, and a lunr index, from the contents of the contents directory
- the web directory contains everything that should be hosted publicly to serve this site
