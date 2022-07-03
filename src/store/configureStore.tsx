import { createStore, applyMiddleware, combineReducers } from "redux";
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from "redux-devtools-extension";
import UtilReducer from "./util/reducer";
import { PermissionReducer } from "./permission/reducer";
import { SearchReducer } from "./search/reducer";
import { SystemReducer } from "./system/reducer";
import { AccessMediatorReducer } from "./access-mediator/reducer";
import { LogReducer } from "./log/view/reducer";
import { LogRulesReducer } from "./log/rules/reducer";
import { UploadReducer } from "./upload/reducer";

const rootReducer = combineReducers({
    util: UtilReducer,
    system: SystemReducer,
    permission: PermissionReducer,
    search: SearchReducer,
    accessMediator: AccessMediatorReducer,
    log: LogReducer,
    logRules: LogRulesReducer,
    upload:UploadReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default function configureStore() {
    const middlewares = [thunkMiddleware];
    const middleWareEnhancer = applyMiddleware(...middlewares);

    const store = createStore(
        rootReducer,
        composeWithDevTools(middleWareEnhancer)
    );

    return store;
}