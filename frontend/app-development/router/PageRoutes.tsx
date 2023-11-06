import React from 'react';
import classes from './PageRoutes.module.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from 'app-development/layout/AppShell';
import { RoutePaths } from 'app-development/enums/RoutePaths';
import { routerRoutes } from 'app-development/router/routes';

const basePath = '/:org/:app';

/**
 * Displays the routes for app development pages
 */
export const PageRoutes = () => {
  return (
    <div className={classes.root}>
      <Routes>
        <Route path={basePath} element={<AppShell />}>
          {/* Redirects from /:org/:app to child route /overview */}
          <Route path={RoutePaths.Root} element={<Navigate to={RoutePaths.Overview} />} />
          {routerRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.subapp {...route.props} />} />
          ))}
        </Route>
      </Routes>
    </div>
  );
};