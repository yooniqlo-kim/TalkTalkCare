// src/routes/Router.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage.tsx';
import CallPage from '../pages/CallPage';
import GameListPage from '../pages/GameListPage.tsx';
import TestPage from '../pages/TestPage';
import MyPage from '../pages/my_page/MyPage.tsx';
import UserInfoPage from '../pages/my_page/UserInfoPage.tsx';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/game" element={<GameListPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/userinfopage" element={<UserInfoPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;