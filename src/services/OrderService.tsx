import Environment from '../Environment';
import BaseService from './BaseService';

class OrderService extends BaseService {

    checkPermission(userId: string, guid: string) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "Order/CheckPermission/" + userId + "/" + guid)
                .then((results) => {
                    let jsonData = results.data as string;
                    let rs = JSON.parse(jsonData);
                    resolve(rs);
                }).catch(() => {
                    resolve({});
                });
        });
        return promise;
    }



}

export default OrderService;