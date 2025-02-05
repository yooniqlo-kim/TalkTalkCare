// src/routes/Router.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage.tsx';
import KeyPad from '../pages/call_page/KeyPad.tsx';
import GameListPage from '../pages/GameListPage.tsx';
// import TestPage from '../pages/TestPage';
import MyPage from '../pages/my_page/MyPage.tsx';
import UserInfoPage from '../pages/my_page/UserInfoPage.tsx';
import Test from '../pages/DimentiaTest/test.tsx';
import SDQ from '../pages/DimentiaTest/test_page/SDQ.tsx';
import SMCQ from '../pages/DimentiaTest/test_page/smcq.tsx';
import SignUp from '../pages/user_page/SignUp.tsx';



const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/call" element={<KeyPad />} />
        <Route path="/game" element={<GameListPage />} />
        <Route path="/test" element={<Test />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/userinfopage" element={<UserInfoPage />} />
        <Route path="/sdq" element={<SDQ />} />
        <Route path="/smcq" element={<SMCQ />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;