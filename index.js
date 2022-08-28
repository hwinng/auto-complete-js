
const apis = Object.freeze({
    query_by_sh: "https://api.json-generator.com/templates/k78yyghl9qrn/data",
    query_by_shirt: "https://api.json-generator.com/templates/PGMv7BZg8RT8/data",
    query_by_polo: "https://api.json-generator.com/templates/djN4XlWG0hHg/data",
});

const TOKEN = 'ydckmbhofs2oqlsn1aap2n8wv1txvhnt4vume9wa';

const ORDER_SETTING = Object.freeze({
    SUGGESTION: "SUGGESTION",
    COLLECTION: "COLLECTION",
    PRODUCT: "PRODUCT"
})

class DOMClass {
    createElement(tag, className, id) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        if (id) element.id = id;
        return element;
    }

    getElement(selector) {
        const element = document.querySelector(selector);
        return element;
    }

    styleBlock($node, style) {
        $($node).css(style);
    }
}

class WidgetModel {
    constructor(numberOfCharacter = 1) {
        this.data = null;
        this.numberOfCharacter = numberOfCharacter;
    }

    // fixed api call depends on numberOfCharacter
    getSearchResult(keyword) {
        return new Promise((resolve, reject) => {
            let keyStr = keyword.toString().toLowerCase();
            if (keyStr === 's' || keyStr === 'sh') {
                this.fetchData(apis.query_by_sh)
                    .then((res) => {
                        this.data = res;
                        resolve(this.data);
                    })
                    .catch(_ => reject(_));
            } else if (keyStr.length > 2 && 'shirt'.includes(keyStr)) {
                this.fetchData(apis.query_by_shirt)
                    .then((res) => {
                        this.data = res;
                        resolve(this.data);
                    })
                    .catch(_ => reject(_));
            } else if ('polo'.includes(keyStr)) {
                this.fetchData(apis.query_by_polo)
                    .then((res) => {
                        this.data = res;
                        resolve(this.data);
                    })
                    .catch(_ => reject(_));
            }
            else {
                resolve([]);
            }
        })
    }

    fetchData(url, type = 'GET') {
        return new Promise((resolve, reject) => {
            $.ajax({
                type,
                url,
                headers: { "Authorization": `Bearer ${TOKEN}` },
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                success: function (result) {
                    resolve(result);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });
    };
}

class WidgetView extends DOMClass {
    constructor(inputNodeId, clearInputId, widgetNodeId, suggestionSetting, collectionSetting, productSetting, orderSetting) {
        super();
        this.createElement = super.createElement;
        this.getElement = super.getElement;
        this.styleBlock = super.styleBlock;

        this.inputNodeId = inputNodeId;
        this.clearInputId = clearInputId;
        this.widgetNodeId = widgetNodeId;
        this.suggestionSetting = suggestionSetting;
        this.collectionSetting = collectionSetting;
        this.productSetting = productSetting;
        this.orderSetting = orderSetting;

        this.$input = this.getElement(`#${this.inputNodeId}`);
        this.$clearBtn = this.getElement(`#${this.clearInputId}`);
        this.$root = this.getElement('#root');

        this.$popupContainer = this.createElement('div', 'popup-container', 'popup-container');
        this.$popoverBtn = this.createElement('div', 'search-popover');
        this.$widgetContainer = this.createElement('div', this.widgetNodeId, this.widgetNodeId);

        // add popover btn and suggestion container div into popupContainer
        this.$popupContainer.appendChild(this.$popoverBtn);
        this.$popupContainer.appendChild(this.$widgetContainer);
        this.$root.appendChild(this.$popupContainer);

        // Init state of clear button
        this.toggleUIState();
    }

    displayWidget(data) {
        this.toggleUIState();

        // remove all child nodes of widgetContainer
        while (this.$widgetContainer.firstChild) {
            this.$widgetContainer.removeChild(this.$widgetContainer.firstChild);
        }

        if (!data.length) {
            const p = this.createElement('p', 'empty-message');
            p.textContent = 'Nothing to search. Please try other keyword!'
            p.style.margin = 'auto';
            this.$widgetContainer.appendChild(p);
        } else {
            const { terms, collections, products } = data[0];
            for (let i = 0; i < this.orderSetting.length; i++) {
                if (this.orderSetting[i] === ORDER_SETTING.SUGGESTION) {
                    const suggestionView = new SuggestionsBlock(this.suggestionSetting.title, this.suggestionSetting.maximumItems, this.$widgetContainer, this.$input, this.suggestionSetting.className);
                    suggestionView.displayBlock(terms);
                }
                if (this.orderSetting[i] === ORDER_SETTING.COLLECTION) {
                    const collectionView = new CollectionsBlock(this.collectionSetting.title, this.collectionSetting.maximumItems, this.$widgetContainer, this.$input, this.collectionSetting.className);
                    collectionView.displayBlock(collections);
                }
                if (this.orderSetting[i] === ORDER_SETTING.PRODUCT) {
                    const productView = new ProductsBlock(this.productSetting.title, this.productSetting.maximumItems, this.$widgetContainer, this.$input, this.productSetting.className);
                    productView.displayBlock(products);
                }
            }

        }

    }

    clearSearch() {
        this.$input.value = '';
        this.$input.focus();
        this.toggleUIState();
    }

    toggleUIState() {
        if (!this.$input?.value) {
            this.styleBlock(this.$clearBtn, { display: 'none' });
            this.styleBlock(this.$popupContainer, { display: 'none' });
        } else {
            this.styleBlock(this.$clearBtn, { display: 'block' });
            this.styleBlock(this.$popupContainer, { display: 'block' });
        }
    }
}

// Abstract class for difference block of widget
class WidgetBlock extends DOMClass {
    constructor(title, maximumItems, parentNode, inputNode, blockClassName) {
        super();
        this.createElement = super.createElement;
        this.getElement = super.createElement;

        this.title = title;
        this.maximumItems = maximumItems;
        this.blockClassName = blockClassName;
        this.$parentNode = parentNode;
        this.$inputNode = inputNode;

        this.$blockNode = this.createBlockDOM('div', this.blockClassName);
    }

    createBlockDOM(tag, className, id) {
        const $label = this.createElement('p', 'label');
        this.$blockNode = this.createElement(tag, className, id);
        $label.textContent = this.title;
        this.$blockNode.appendChild($label);

        // add to dom tree
        this.$parentNode.appendChild(this.$blockNode);

        return this.$blockNode;
    };

    displayBlock(items) {
        let $ul = this.createElement('ul');
        if (items.length) {
            items.slice(0, this.maximumItems).forEach((item) => {
                let $li = this.createElement('li', 'item');
                let $a = this.createElement('a');
                let typingKeyword = this.$inputNode?.value.toLowerCase();
                let matchedContent = (item.term || item.title).toLowerCase().replace(typingKeyword, `<b>${typingKeyword}</b>`);

                if (item.title) {
                    matchedContent = item.title;
                }

                $a.innerHTML = matchedContent;
                $a.href = item.url;
                $li.appendChild($a);
                $ul.appendChild($li);
            })
        };
        this.$blockNode.appendChild($ul);
    };
}

class SuggestionsBlock extends WidgetBlock {
    constructor(title, maximumItems, parentNode, inputNode, blockClassName) {
        super(title, maximumItems, parentNode, inputNode, blockClassName);
    }
}

class CollectionsBlock extends WidgetBlock {
    constructor(title, maximumItems, parentNode, inputNode, blockClassName) {
        super(title, maximumItems, parentNode, inputNode, blockClassName);
    }
}

class ProductsBlock extends WidgetBlock {
    constructor(title, maximumItems, parentNode, inputNode, blockClassName) {
        super(title, maximumItems, parentNode, inputNode, blockClassName);
    }

    // Override from WidgetBlock
    displayBlock(products,) {
        let $ul = this.createElement('ul', 'product-list');
        if (products.length) {
            products.slice(0, this.maximumItems).forEach((product) => {
                let $li = this.createElement('li', 'item');
                let $a = this.initProductItemNode(product);
                $li.appendChild($a);
                $ul.appendChild($li);
            })
        };

        const $productLink = this.generateProductLinks(products.length, '/products');
        this.$blockNode.appendChild($ul);
        this.$blockNode.appendChild($productLink);


    }

    initProductItemNode(product) {
        const { title, price, brand, url, image } = product;

        const $a = this.createElement('a');

        const $imageWrapper = this.createElement('div', 'product-item-left');
        const $img = this.createElement('img');

        const $productContentWrapper = this.createElement('div', 'product-item-right');
        const $productName = this.createElement('p', 'product-name');
        const $productBrand = this.createElement('p', 'product-brand');
        const $productPrice = this.createElement('p', 'product-price');

        $img.src = image;
        $img.alt = title;
        $productName.textContent = title;
        $productBrand.textContent = brand;
        $productPrice.textContent = price;

        $imageWrapper.appendChild($img);
        $productContentWrapper.appendChild($productName);
        $productContentWrapper.appendChild($productBrand);
        $productContentWrapper.appendChild($productPrice);

        $a.src = url;
        $a.appendChild($imageWrapper);
        $a.appendChild($productContentWrapper);

        return $a;
    }

    generateProductLinks(numberOfProducts, url) {
        let $productLink = this.createElement('a', 'product-links');
        $productLink.href = url;
        $productLink.textContent = `View all ${numberOfProducts} products`;
        return $productLink;
    }
}

class WidgetController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    displayWidgetHandler(data) {
        this.view.displayWidget(data);
    }

    async onChangeHandler(keyword) {
        const data = await this.model.getSearchResult(keyword);
        this.displayWidgetHandler(data);
    }
}

// TEST
function main() {
    const orderSetting = [ORDER_SETTING.SUGGESTION, ORDER_SETTING.COLLECTION, ORDER_SETTING.PRODUCT];
    const suggestionSetting = {
        title: 'Suggestions',
        maximumItems: 4,
        className: 'term-container'
    }
    const collectionSetting = {
        title: 'Collections',
        maximumItems: 2,
        className: 'collection-container'
    }
    const productSetting = {
        title: 'Products',
        maximumItems: 6,
        className: 'product-container'
    }

    const widgetView = new WidgetView('search', 'clear-search-btn', 'widget-container', suggestionSetting, collectionSetting, productSetting, orderSetting);
    const widgetModel = new WidgetModel();
    const app = new WidgetController(widgetModel, widgetView);
    const appView = app.view;
    const appModel = app.model;

    // re-render widget base on number of setting characters
    $(`#${appView.inputNodeId}`).keyup(function (e) {
        if (e.target.value.length === 0) {
            appView.toggleUIState();
        } else {
            let { numberOfCharacter } = appModel;
            // each keyup event fires will re-render once
            if (numberOfCharacter === 1) {
                app.onChangeHandler(e.target.value);
            }
            // each numberOfCharacter will re-render again
            if (appModel.numberOfCharacter > 1) {
                let inputVal = appView.$input?.value;
                if (inputVal.length && inputVal.length % Number(numberOfCharacter) === 0) {
                    app.onChangeHandler(e.target.value);
                }
            }
        }
    });

    $(`#${appView.clearInputId}`).click(function () {
        appView.clearSearch();
    })

    // use event delegation to handle multiple same clicks on each label of block
    $(`#${appView.widgetNodeId}`).click(function (e) {
        if (e.target.tagName === 'P' && e.target.className === 'label') {
            const $nextSibling = e.target.nextSibling;
            let style = {
                display: 'none'
            };
            if ($nextSibling.style.display === 'none') {
                if ($nextSibling.className === 'product-list') {
                    style = {
                        display: 'flex',
                        flexDirection: 'column',
                        paddingLeft: '12px',
                        marginBlock: 0,
                    }
                    appView.styleBlock($nextSibling, style);
                } else {
                    style = {
                        display: 'block'
                    }
                    appView.styleBlock($nextSibling, style);
                }
            } else {
                appView.styleBlock($nextSibling, style);
            }
        }
    });
}

main();