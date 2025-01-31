// import React, { useState } from 'react';
// import { UserPlus } from 'lucide-react';
// import Header from '../components/layout/Header';
// import MainMenu from '../components/layout/MainMenu';
// import Analytics from '../components/layout/Analytics';
// import FriendList from '../components/layout/FriendList';

// interface MainPageProps {
//   showFriendListByDefault?: boolean;
// }

// const MainPage: React.FC<MainPageProps> = ({ showFriendListByDefault = false }) => {
//   const [showFriendList, setShowFriendList] = useState(showFriendListByDefault);

//   return (
//     <div 
//       className="flex min-h-screen relative" 
//       style={{
//         display: 'flex', 
//         backgroundColor: '#F5FFEA',
//         justifyContent: 'flex-start'
//       }}
//     >
//       <div 
//         className="flex-1" 
//         style={{ 
//           maxWidth: showFriendList ? 'calc(100% - 320px)' : '100%', 
//           padding: '24px',
//           transition: 'max-width 0.3s ease-in-out' 
//         }}
//       >
//         <div className="bg-white rounded-xl p-6 mt-6" style={{ width: '100%' }}>
//           {!showFriendList && (
//             <div className="flex justify-end mb-4">
//               <button
//                 onClick={() => setShowFriendList(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
//               >
//                 <UserPlus size={20} />
//                 <span>친구목록</span>
//               </button>
//             </div>
//           )}
//           <div className="menu-card flex gap-6" style={{ width: '100%' }}>
//             <div style={{ width: 'calc(50% - 3px)', marginLeft: '250px' }}>
//               <MainMenu />
//             </div>
//             <div style={{ width: 'calc(50% - 3px)', marginLeft: '250px' }}>
//               <Analytics />
//             </div>
//           </div>
//         </div>
//       </div>

//       {showFriendList && (
//         <div style={{ width: '300px', marginRight: '200px' }}>
//           <FriendList onClose={() => setShowFriendList(false)} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default MainPage;
import React, { useState } from 'react';
import { List } from 'lucide-react';
import MainMenu from '../components/layout/MainMenu';
import Analytics from '../components/layout/Analytics';
import FriendList from '../components/layout/FriendList';

interface MainPageProps {
  showFriendListByDefault?: boolean;
}

const MainPage: React.FC<MainPageProps> = ({ showFriendListByDefault = false }) => {
  const [showFriendList, setShowFriendList] = useState(showFriendListByDefault);

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        display: 'flex',
        backgroundColor: '#F5FFEA',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <div
        className="flex"
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div
          className="bg-white rounded-xl p-6"
          style={{
            width: '600px',
            transition: 'width 0.3s ease-in-out',
          }}
        >
          {!showFriendList && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowFriendList(true)}
                className="p-3 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                aria-label="친구목록 열기"
                value={'친구목록'}
              >
                <List size={24} />
              </button>
            </div>
          )}
          <div
            className={`menu-card ${showFriendList ? 'flex gap-6' : 'flex flex-col items-center'}`}
            style={{
              justifyContent: !showFriendList ? 'center' : 'flex-start',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            <div
              style={{
                width: showFriendList ? 'calc(50% - 12px)' : '100%',
                marginBottom: !showFriendList ? '12px' : '0',
                textAlign: !showFriendList ? 'center' : 'left',
              }}
            >
              <MainMenu />
            </div>
            <div
              style={{
                width: showFriendList ? 'calc(50% - 12px)' : '100%',
                textAlign: !showFriendList ? 'center' : 'left',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Analytics />
            </div>
          </div>
        </div>

        {showFriendList && (
          <div
            className="bg-white rounded-xl p-6"
            style={{
              width: '320px',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            <FriendList onClose={() => setShowFriendList(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;


