import WidgetController from "./widgetController";
import WidgetModel from "./widgetModel";
import WidgetView from "./widgetView";

// TEST
const app = new WidgetController(new WidgetModel(), new WidgetView('search', 'clear-search-btn'));


$(`#${app.view.inputNodeId}`).keyup(function (e) {
    app.view.displaySuggestionWidget();
});

$(`#${app.view.clearInputId}`).click(function () {
    app.view.clearSearch();
})