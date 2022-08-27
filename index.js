const apis = Object.freeze({
    query_with_shirt: "https://api.json-generator.com/templates/k78yyghl9qrn/data",
});

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
}

class WidgetModel {
    constructor() {
        this.data = null;
    }

    getSearchResult(keyword) {
        return new Promise((resolve, reject) => {
            let keyStr = keyword.toString().toLowerCase();
            if (keyStr.length > 0 && 'shirt'.includes(keyStr)) {
                this.fetchData(apis.query_with_shirt)
                    .then((res) => {
                        this.data = res;
                        resolve(this.data);
                    })
                    .catch(_ => reject(_));
            } else {
                resolve([]);
            }
        })
    }

    fetchData(url, type = 'GET') {
        return new Promise((resolve, reject) => {
            $.ajax({
                type,
                url,
                headers: { "Authorization": "Bearer ydckmbhofs2oqlsn1aap2n8wv1txvhnt4vume9wa" },
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
    // dynamic DOM query for input fields
    constructor(inputNodeId, clearInputId) {
        super();
        this.inputNodeId = inputNodeId;
        this.clearInputId = clearInputId;
        this.createElement = super.createElement;
        this.getElement = super.getElement;

        this.$input = this.getElement(`#${this.inputNodeId}`);
        this.$clearBtn = this.getElement(`#${this.clearInputId}`);
        this.$root = this.getElement('#root');

        this.$popupContainer = this.createElement('div', 'popup-container', 'popup-container');
        this.$popoverBtn = this.createElement('div', 'search-popover');
        this.$widgetContainer = this.createElement('div', 'widget-container', 'widget-container');

        // add popover btn and suggestion container div into popupContainer
        this.$popupContainer.appendChild(this.$popoverBtn);
        this.$popupContainer.appendChild(this.$widgetContainer);
        this.$root.appendChild(this.$popupContainer);

        // Init state of clear button
        this.toggleUIState();
    }

    displayWidget(data, cb) {
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
            // handle display suggestion herer
            const suggestionsBlock = new SuggestionsBlock('Suggestions', 4, this.$widgetContainer, this.$input, 'term-container',);
            const collectionsBlock = new CollectionsBlock('Collections', 4, this.$widgetContainer, this.$input, 'collection-container');
            const productsBlock = new ProductsBlock('Products', 3, this.$widgetContainer, this.$input, 'product-container');
            suggestionsBlock.displayBlock(terms);
            collectionsBlock.displayBlock(collections);
            productsBlock.displayBlock(products);

        }

    }

    clearSearch() {
        this.$input.value = '';
        this.$input.focus();
        this.toggleUIState();
    }

    toggleUIState() {
        if (!this.$input?.value) {
            this.$clearBtn.style.display = 'none';
            this.$popupContainer.style.display = 'none';
        } else {
            this.$clearBtn.style.display = 'block';
            this.$popupContainer.style.display = 'block';
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
    displayBlock(products) {
        let $ul = this.createElement('ul', 'product-list');
        if (products.length) {
            products.slice(0, this.maximumItems).forEach((product) => {
                let $li = this.createElement('li', 'item');
                let $a = this.initProductItemNode(product);

                $li.appendChild($a);
                $ul.appendChild($li);
            })
        };

        this.$blockNode.appendChild($ul);
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
const app = new WidgetController(new WidgetModel(), new WidgetView('search', 'clear-search-btn'));

$(`#${app.view.inputNodeId}`).keyup(function (e) {
    app.onChangeHandler(e.target.value);
});

$(`#${app.view.clearInputId}`).click(function () {
    app.view.clearSearch();
})