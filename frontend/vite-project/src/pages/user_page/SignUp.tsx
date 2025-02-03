// src/pages/SignUp.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera } from 'lucide-react';
import '../../styles/components/SignUp.css';
import Header from '../Header';

const SignUp = () => {
 const navigate = useNavigate();
 const fileInputRef = useRef<HTMLInputElement>(null);
 const [step, setStep] = useState(1);
 const [profileImage, setProfileImage] = useState<File | null>(null);
 const [previewImage, setPreviewImage] = useState<string | null>(null);
 const [formData, setFormData] = useState({
   name: '',
   id: '',
   nickname: '',
   password: '',
   passwordConfirm: '',
   birthdate: '',
 });
 const [isNicknameChecked, setIsNicknameChecked] = useState(false);
 const [passwordError, setPasswordError] = useState('');

 const handleImageClick = () => {
   fileInputRef.current?.click();
 };

 const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   const file = event.target.files?.[0];
   if (file) {
     setProfileImage(file);
     // 이미지 미리보기 생성
     const reader = new FileReader();
     reader.onloadend = () => {
       setPreviewImage(reader.result as string);
     };
     reader.readAsDataURL(file);
   }
 };

 const handleNext = (currentStep: number) => {
   if (validateCurrentStep(currentStep)) {
     setStep(prev => prev + 1);
   }
 };

 const validateCurrentStep = (currentStep: number): boolean => {
   switch (currentStep) {
     case 1:
       return formData.name.length > 0;
     case 2:
       return formData.id.length >= 6;
     case 3:
       return isNicknameChecked && formData.nickname.length > 0;
     case 4:
       if (formData.password.length < 8) return false;
       if (formData.password !== formData.passwordConfirm) {
         setPasswordError('비밀번호가 일치하지 않습니다');
         return false;
       }
       setPasswordError('');
       return true;
     default:
       return true;
   }
 };

 const handleKeyPress = (e: React.KeyboardEvent, currentStep: number) => {
   if (e.key === 'Enter') {
     e.preventDefault();
     handleNext(currentStep);
   }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));

   if (name === 'nickname') {
     setIsNicknameChecked(false);
   }
 };

 const checkNicknameDuplicate = async () => {
   try {
     // TODO: API 연동
     setIsNicknameChecked(true);
     alert('사용 가능한 닉네임입니다.');
   } catch (error) {
     alert('닉네임 중복 확인에 실패했습니다.');
   }
 };

 const handleSubmit = async () => {
   if (!isNicknameChecked) {
     alert('닉네임 중복확인이 필요합니다.');
     return;
   }

   try {
     const submitData = new FormData();
     
     Object.keys(formData).forEach(key => {
       submitData.append(key, formData[key as keyof typeof formData]);
     });

     if (profileImage) {
       submitData.append('profileImage', profileImage);
     }

     console.log('회원가입 데이터:', submitData);
     navigate('/login');
   } catch (error) {
     console.error('회원가입 실패:', error);
     alert('회원가입에 실패했습니다.');
   }
 };

 return (
   <div className="signup-container">
     <Header className="signup-header" />
     <div className="signup-content">
       <div className={`signup-form step-${step}`}>
         {/* 프로필 이미지 업로드 */}
         <div className="profile-upload">
           <div 
             className="profile-image-container" 
             onClick={handleImageClick}
           >
             {previewImage ? (
               <img 
                 src={previewImage} 
                 alt="프로필" 
                 className="profile-preview" 
               />
             ) : (
               <div className="profile-placeholder">
                 <User size={40} />
               </div>
             )}
             <div className="camera-icon">
               <Camera size={20} />
             </div>
           </div>
           <input
             type="file"
             ref={fileInputRef}
             onChange={handleImageChange}
             accept="image/*"
             style={{ display: 'none' }}
           />
           <p>프로필 사진 등록</p>
         </div>

         {/* 이름 입력 */}
         <div className="input-group">
           <input
             type="text"
             name="name"
             value={formData.name}
             onChange={handleChange}
             onKeyPress={(e) => handleKeyPress(e, 1)}
             placeholder="이름을 입력하세요"
             autoFocus
           />
           {step === 1 && (
             <button 
               onClick={() => handleNext(1)}
               className="next-button"
               disabled={!formData.name}
             >
               다음
             </button>
           )}
         </div>

         {/* ID 입력 */}
         {step >= 2 && (
           <div className="input-group">
             <input
               type="text"
               name="id"
               value={formData.id}
               onChange={handleChange}
               onKeyPress={(e) => handleKeyPress(e, 2)}
               placeholder="아이디를 입력하세요 (6자 이상)"
             />
             {step === 2 && (
               <button 
                 onClick={() => handleNext(2)}
                 className="next-button"
                 disabled={formData.id.length < 6}
               >
                 다음
               </button>
             )}
           </div>
         )}

         {/* 닉네임 입력 */}
         {step >= 3 && (
           <div className="input-group">
             <div className="nickname-container">
               <input
                 type="text"
                 name="nickname"
                 value={formData.nickname}
                 onChange={handleChange}
                 placeholder="닉네임을 입력하세요"
               />
               <button 
                 onClick={checkNicknameDuplicate}
                 className="check-button"
                 disabled={!formData.nickname}
               >
                 중복확인
               </button>
             </div>
             {step === 3 && (
               <button 
                 onClick={() => handleNext(3)}
                 className="next-button"
                 disabled={!isNicknameChecked}
               >
                 다음
               </button>
             )}
           </div>
         )}

         {/* 비밀번호 입력 */}
         {step >= 4 && (
           <div className="input-group">
             <input
               type="password"
               name="password"
               value={formData.password}
               onChange={handleChange}
               placeholder="비밀번호를 입력하세요 (8자 이상)"
             />
             <input
               type="password"
               name="passwordConfirm"
               value={formData.passwordConfirm}
               onChange={handleChange}
               placeholder="비밀번호를 다시 입력하세요"
               className="mt-2"
             />
             {passwordError && <p className="error-message">{passwordError}</p>}
             {step === 4 && (
               <button 
                 onClick={() => handleNext(4)}
                 className="next-button"
                 disabled={formData.password.length < 8 || formData.password !== formData.passwordConfirm}
               >
                 다음
               </button>
             )}
           </div>
         )}

         {/* 생년월일 입력 */}
         {step >= 5 && (
           <div className="input-group">
             <input
               type="date"
               name="birthdate"
               value={formData.birthdate}
               onChange={handleChange}
               onKeyPress={(e) => handleKeyPress(e, 4)}
             />
             <button 
               onClick={handleSubmit}
               className="submit-button"
               disabled={!formData.birthdate}
             >
               가입하기
             </button>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default SignUp;