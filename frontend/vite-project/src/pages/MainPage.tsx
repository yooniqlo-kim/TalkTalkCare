// import React, { useState } from 'react';
// import { List } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import MainMenu from './main_page/MainMenu';
// import Analytics from './main_page/Analytics';
// import FriendList from './main_page/FriendList';
// import SpeechToText from './Voice';
// import LoginPage from './user_page/LoginPage';

// interface MainPageProps {
//   showFriendListByDefault?: boolean;
// }

// const MainPage: React.FC<MainPageProps> = ({ showFriendListByDefault = false }) => {
//   const [showFriendList, setShowFriendList] = useState(showFriendListByDefault);
//   const navigate = useNavigate();

//   return (
//     <div
//       className="flex min-h-screen relative"
//       style={{
//         display: 'flex',
//         backgroundColor: '#F5FFEA',
//         justifyContent: 'center',
//         alignItems: 'center',
//         transition: 'all 0.3s ease-in-out',
//       }}
//     >
//       {/* <SpeechToText /> */}
//       <div
//         className="flex"
//         style={{
//           display: 'flex',
//           gap: '24px',
//           alignItems: 'flex-start',
//           transition: 'all 0.3s ease-in-out',
//         }}
//       >
//         <div
//           className="bg-white rounded-xl p-6"
//           style={{
//             width: '600px',
//             transition: 'width 0.3s ease-in-out',
//           }}
//         >
//           {!showFriendList && (
//             <div className="flex justify-end mb-4">
//               <button
//                 onClick={() => setShowFriendList(true)}
//                 className="p-3 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
//                 aria-label="s친구목록 열기"
//                 value={'친구목록'}
//               >
//                 <List size={24} />
//               </button>
//             </div>
//           )}
//           <div
//             className={`menu-card ${showFriendList ? 'flex gap-6' : 'flex flex-col items-center'}`}
//             style={{
//               justifyContent: !showFriendList ? 'center' : 'flex-start',
//               transition: 'all 0.3s ease-in-out',
//             }}
//           >
//             <div
//               style={{
//                 width: showFriendList ? 'calc(50% - 12px)' : '100%',
//                 marginBottom: !showFriendList ? '12px' : '0',
//                 textAlign: !showFriendList ? 'center' : 'left',
//               }}
//             >
//               <MainMenu />
//             </div>
//             <div
//               style={{
//                 width: showFriendList ? 'calc(50% - 12px)' : '100%',
//                 textAlign: !showFriendList ? 'center' : 'left',
//                 display: 'flex',
//                 justifyContent: 'center',
//               }}
//             >
//               <Analytics />
//             </div>
//           </div>
//         </div>

//         {showFriendList && (
//           <div
//             className="bg-white rounded-xl p-6"
//             style={{
//               width: '320px',
//               transition: 'transform 0.3s ease-in-out',
//             }}
//           >
//             <FriendList onClose={() => setShowFriendList(false)} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MainPage;
import React, { useState } from 'react';
import { List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainMenu from './main_page/MainMenu';
import Analytics from './main_page/Analytics';
import FriendList from './main_page/FriendList';
import '../styles/components/MainPage.css';

const MainPage: React.FC = () => {
  const [showFriendList, setShowFriendList] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="main-page-container">
      <div className="main-page-content">
        {/* 친구 목록 열기 버튼 */}
        {!showFriendList && (
          <div className="friend-list-toggle">
            <button onClick={() => setShowFriendList(true)} aria-label="친구 목록 열기">
              <List size={28} />
            </button>
          </div>
        )}

        {/* 메뉴 카드 (일렬 정렬) */}
        <div className="menu-card">
          <MainMenu />
          <Analytics />
        </div>
      </div>

      {/* 친구 목록 표시 */}
      {showFriendList && (
        <div className="friend-list-container">
          <FriendList onClose={() => setShowFriendList(false)} />
        </div>
      )}
    </div>
  );
};

export default MainPage;