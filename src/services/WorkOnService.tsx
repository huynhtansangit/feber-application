import BaseService from "./BaseService";
import Environment from "../Environment";


class WorkOnService extends BaseService {

    cancelWorkflow(userToken: string, correlationId: string, workflowId: string, reason: string) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "WorkOn/CancelWorkflow/"
                + correlationId + "/" +
                + workflowId + "/"
                + encodeURI(reason), {
                headers: { "Authorization": userToken }
            })
                .then((result) => {
                    resolve(result);
                }).catch(() => {
                    resolve({});
                });
        });
        return promise;
    }

}

export default WorkOnService;