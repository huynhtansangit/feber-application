
import "@pnp/polyfill-ie11";
import { sp, Web, SPRest, PagedItemCollection, IItems } from '@pnp/sp/presets/all';
import Axios, { AxiosStatic } from 'axios';
import Environment from '../Environment';
import _ from "lodash";

class BaseService {

    axios: AxiosStatic = Axios;

    sp: SPRest = sp;

    constructor() {
        this.sp.setup({
            ie11: true,
            sp: {
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                baseUrl: Environment.rootWeb
            }
        });
    }

    getAllListItems(listName: string, webUrl: string = Environment.rootWeb, sortField: string = "ID", isAscending: boolean = false, filterCondition: string = "", selections: string[] = [], expansions: string[] = []): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            let items: IItems = (webUrl === "") ?
                this.sp.web.lists.getByTitle(listName).items
                : Web(webUrl).lists.getByTitle(listName).items;
            if (filterCondition !== "") {
                items = items.filter(filterCondition);
            }
            if (selections.length > 0) {
                items = items.select(...selections);
            }
            if (expansions.length > 0) {
                items = items.expand(...expansions);
            }
            this._getAllListItems(items.top(4000).orderBy(sortField, isAscending).getPaged()).then((results: any[]) => {
                resolve(results);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    private _getAllListItems(itemsPromise: Promise<PagedItemCollection<any[]>>, finalResults: any[] = [], resolveCallback: any = null): Promise<any[]> {
        let fResult: any[] = finalResults;
        let promise: Promise<any[]> = new Promise((resolve) => {
            itemsPromise.then((rs: PagedItemCollection<any[]>) => {
                fResult.push(...rs.results);
                if (rs.hasNext === true) {
                    this._getAllListItems(rs.getNext(), fResult, (resolveCallback !== null) ? resolveCallback : resolve);
                }
                else if (_.isNil(resolveCallback)) {
                    resolve(fResult);
                }
                else {
                    resolveCallback(fResult);
                }
            }).catch(() => {
                resolve([]);
            });
        })
        return promise;
    }

}

export default BaseService;