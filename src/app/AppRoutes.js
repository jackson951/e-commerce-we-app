import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from '../components/Home';
import Products from '../components/Products';
import Cart from '../components/Cart';
import NotFound from '../components/NotFound';

const AppRoutes = () => {
    return (
        <Router>
            <Switch>
                <Route path='/' exact component={Home} />
                <Route path='/products' component={Products} />
                <Route path='/cart' component={Cart} />
                <Route component={NotFound} />
            </Switch>
        </Router>
    );
};

export default AppRoutes;