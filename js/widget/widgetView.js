class WidgetView {
    // dynamic DOM query for input fields
    constructor(inputNodeId, clearInputId) {
        this.inputNodeId = inputNodeId;
        this.clearInputId = clearInputId;

        this.$input = this.getElement(`#${this.inputNodeId}`);
        this.$clearBtn = this.getElement(`#${this.clearInputId}`);
        this.$root = this.getElement('#root');

        this.$popupContainer = this.createElement('div', 'popup-container', 'popup-container');
        this.$popoverBtn = this.createElement('div', 'search-popover');
        this.$suggestionContainer = this.createElement('div', 'suggestion-container', 'suggestion-container');

        // add popover btn and suggestion container div into popupContainer
        this.$popupContainer.appendChild(this.$popoverBtn);
        this.$popupContainer.appendChild(this.$suggestionContainer);
        this.$root.appendChild(this.$popupContainer);

        // Init state of clear button
        this.toggleUIState();
    }

    displaySuggestionWidget() {
        this.toggleUIState();
    }

    clearSearch() {
        this.$input.value = '';
        this.$input.focus();
        this.toggleClearBtn();
    }

    toggleUIState() {
        if (!this.$input?.value) {
            this.$clearBtn.style.display = 'none';
            this.$popupContainer.style.display = 'none';
        } else {
            this.$clearBtn.style.display = 'block';
            this.$popupContainer.style.display = 'flex';
        }
    }

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

export default WidgetView;