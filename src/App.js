import React, { StrictMode } from 'react';
import { css } from '@emotion/core';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

function App() {
    const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();

    useEffect(() => {
        history.listen((location, action) => {
            // clear alert on location change
            dispatch(alertActions.clear());
        });
    }, []);
  return(
    <StrictMode>
      <Router history={history}>
        <Switch>
          <PrivateRoute exact path="/" component={HomePage} />
        </Switch>
      </Router>
    </StrictMode>
  );
}

export default App;
