import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ReactQueryDevtools } from 'react-query/devtools'

import { MainLayout, LoginLayout, PrivateRoute, PublicRoute, AdminRoute, ContributorRoute, ReaderRoute, NoRoleRoute } from 'components'

import {
  AllPhotos,
  Located,
  Map,
  Login,
  SetPassword,
  ForgotPassword,
  NoRole,
  AllPersons,
  Person,
  AllUsers,
  UploadFiles,
  Usage
} from 'pages'

import { Providers } from 'context/providers_wrapper'

export const App = () => {
  return (
    <Router>
      <Providers>
        <Routes>
          <Route
            path='/'
            element={
              <PrivateRoute>
                <ReaderRoute>
                  <MainLayout />
                </ReaderRoute>
              </PrivateRoute>
            }
          >
            <Route path='photos' element={<AllPhotos />} />
            <Route path='persons' element={<AllPersons />} />
            <Route path='person/:id' element={<Person />} />
            <Route path='map' element={<Map />} />
            <Route path='located/:geohash' element={<Located />} />
            <Route path='*' element={<Navigate to='/photos' />} />
            <Route index element={<Navigate to='/photos' replace />} />
          </Route>

          <Route
            path='/contributor'
            element={
              <PrivateRoute>
                <ContributorRoute>
                  <MainLayout />
                </ContributorRoute>
              </PrivateRoute>
            }
          >
            <Route path='upload' element={<UploadFiles />} />
            <Route index element={<Navigate to='/contributor/upload' replace />} />
          </Route>

          <Route
            path='/admin'
            element={
              <PrivateRoute>
                <AdminRoute>
                  <MainLayout />
                </AdminRoute>
              </PrivateRoute>
            }
          >
            <Route path='users' element={<AllUsers />} />
            <Route path='usage' element={<Usage />} />
            <Route index element={<Navigate to='/admin/users' replace />} />
          </Route>

          <Route
            path='/no-role'
            element={
              <PrivateRoute>
                <LoginLayout />
              </PrivateRoute>
            }
          >
            <Route
              index
              element={
                <NoRoleRoute>
                  <NoRole />
                </NoRoleRoute>
              }
            />
          </Route>

          <Route
            path='/login'
            element={
              <PublicRoute>
                <LoginLayout />
              </PublicRoute>
            }
          >
            <Route path='forgot-password' element={<ForgotPassword />} />
            <Route path='set-password' element={<SetPassword />} />
            <Route index element={<Login />} />
          </Route>
        </Routes>
        <ReactQueryDevtools initialIsOpen={false} position='bottom-left' />
      </Providers>
    </Router>
  )
}
