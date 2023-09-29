const cName = document.querySelector('#cityname').value;
const destpage = `http://localhost:3000/api/${cName}`

const items = async () => {
    try {
        const response = await axios.get(destpage);
        const destItems = response.data;

        console.log(destItems);

        return destItems;
    } catch (errors) {
        console.error(errors);
    }

}

const createPage = item => {
    const createItems = document.createElement('li');
    createItems.appendChild(document.createTextNode(item.title));

    return createItems;
}

const updatePage = destItems => {
    const update = document.querySelector('ul');

    if(Array.isArray(destItems) && destItems.length > 0) {
        destItems.map(destItem => {
            update.appendChild(createPage(destItem));
        });
    } else if (destItems) {
        update.appendChild(createPage(destItems));
    }
};

const main = async () => {
    updatePage(await items());
};

main();