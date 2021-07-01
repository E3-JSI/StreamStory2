import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import SessionProvider from './components/SessionProvider';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    // Strict mode causes duplication of style nodes in material-ui 4.x, when
    // switching global theme:
    // https://github.com/mui-org/material-ui/issues/20708
    // Since strict mode is only active in development environment, production
    // is not affected. It can however affect browser responsiveness in
    // development environment if theme is switched too many times and page
    // reload is necessary.
    //
    // Known warnings in strict mode for materialu-ui 4.x (move to README):
    // 1) Warning: findDOMNode is deprecated in StrictMode.
    //    Issue: https://github.com/mui-org/material-ui/issues/18018
    //    Affected components:
    //    - Menu (user accoun menu in header)
    <React.StrictMode>
        <SessionProvider>
            <App />
        </SessionProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
