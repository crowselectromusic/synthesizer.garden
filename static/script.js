
const getDoc = (ref) => {
    return window.searchIndex.documentStore.docs[ref];
}

const searchButtons = [ // tags: digital, hybrid, drum, diy, open hardware, sequencer, 
    {
        title: "<$100",
        command: "price:<100"
    }
];
