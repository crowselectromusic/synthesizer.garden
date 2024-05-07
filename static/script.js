const indexUrl = "index.json";
const contentUrl = "content.json";


const fetchSynths = async () => {
    let response = await fetch(indexUrl);
    let json = await response.json();
    let index = lunr.Index.load(json);

    let secondResponse = await fetch(contentUrl);
    let secondData = await secondResponse.json();

    // sort and limit tags so that it's just the top 5 or 10.
    let tags = Object.keys(secondData.tags).sort((a,b)=>{
        return secondData.tags[a] - secondData.tags[b];
    })

    return { index: index, content: secondData.entities, tags: tags };
}

const searchButtons = [ // tags: digital, hybrid, drum, diy, open hardware, sequencer, 
    {
        title: "<$100",
        command: "price:<100"
    }
];
