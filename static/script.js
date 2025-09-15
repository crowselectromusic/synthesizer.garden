const searchButtons = [ // tags: digital, hybrid, drum, diy, open hardware, sequencer, 
    {
        title: "drone",
        command: "drone"
    }
];

async function loadIndex() {
    let response = await fetch('/search_index.json');
    let data = await response.json();
    return elasticlunr.Index.load(data);
}

document.addEventListener('alpine:init', () => {
    Alpine.data('searcher', () => ({
        search: '',
        index: [],
        content: {},
        tags: ['digital', 'analog', 'hybrid', 'drum', 'midi', 'cv'],
        searchResults: ()=>{},
        async init () {
            let index = await loadIndex();
            this.index = index
            this.searchResults = ()=>{
                let result = index.search(this.search);
                return result;
            }
        }
    }))
});
