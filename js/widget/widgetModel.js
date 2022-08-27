import { apis } from '../constants/index';

class WidgetModel {
    constructor() {
        this.data = null;
    }

    async getSearchResult(keyword) {
        let keyStr = keyword.toString().toLowerCase();
        if (keyStr.length > 0 && 'shirt'.includes(keyStr)) {
            this.data = await this.fetchData(apis.query_with_shirt);
        }
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

export default WidgetModel;
