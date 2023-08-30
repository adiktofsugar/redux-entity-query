# EntityQuery for Redux

The primary goal of this package is to provide something like [redux-toolkit's entityAdaptor](https://redux-toolkit.js.org/api/createEntityAdapter), but:

- without requiring redux-toolkit
- without needing to use a million extraReducers
- being primarily based on an async method

This doesn't handle all situations the way redux's version does, but I've had the feeling "why is it so hard to put an async method in redux" (especially for responses with keyed values) that I'm setting this up as a first pass for doing this "easily".

## How to use

```
const listQuery = new EntityQuery(['list'], () => () => fetchList())
const itemQuery = new EntityQuery(['item'],
    /** @param {string} id */
    (id) => () => fetchItem(id))

const reducer = combineReducers({
    // NOTE: this is based on the prefix argument
    list: listQuery.reducer,
    item: itemQuery.reducer,
});

function List() {
    const selector = useCallback((state) => listQuery.selectOne(state, null), [id])
    const { complete, pending, result, error } = useSelector(selector);
    if (error) return <pre>{String(error)}</pre>
    if (pending) return <p>loading</p>
    return (
        <ul>
            {result.items.map(item => <Item key={item.id} id={item.id} />)}
        </ul>
    )
}

function Item({ id }) {
    const selector = useCallback((state) => itemQuery.selectOne(state, id), [id])
    const { complete, pending, result, error } = useSelector(selector);
    if (error) return <pre>{String(error)}</pre>
    if (pending) return <p>loading</p>
    return (
        <h1>{item.name}</h1>
    )
}

async function fetchList() {
    const data = fetch('/list').then(r => r.json());
    return new ListResponse(data.items.map(i => new Item(i.id, i.name)));
}
/** @param {string} id */
async function fetchItem(id) {
    const data = fetch('/item/' + id).then(r => r.json());
    return new ItemResponse(new Item(data.id, data.name)));
}

class Item {
    /**
     * @param {string} id
     * @param {string} name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
class ListResponse {
    /** @param {Item[]} items */
    constructor(items) {
        this.items = items;
    }
}
class ItemResponse {
    /** @param {Item} item */
    constuctor(item) {
        this.item = item;
    }
}
```

Look at the "examples" folder for more ideas on how to use this. Everything in there should be applicable to real life.

Feel free to add a PR for more examples if you find this useful!

## Why isn't this published?

I don't really think it's enough of an interface to be published, tbh. If I get any feedback encouraging me to do so I may reconsider.
