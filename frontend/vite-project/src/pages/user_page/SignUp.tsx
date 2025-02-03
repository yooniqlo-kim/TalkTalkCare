import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/SignUp.css';

const SignUp = () => {
 const navigate = useNavigate();
 const [step, setStep] = useState(1);
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
     // const response = await axios.post('/api/check-nickname', { nickname: formData.nickname });
     // setIsNicknameChecked(response.data.isAvailable);
     
     setIsNicknameChecked(true);
     alert('사용 가능한 닉네임입니다.');
   } catch (error) {
     alert('닉네임 중복 확인에 실패했습니다.');
   }
 };

 const handleSubmit = () => {
   if (!isNicknameChecked) {
     alert('닉네임 중복확인이 필요합니다.');
     return;
   }
   console.log('회원가입 데이터:', formData);
   navigate('/login');
 };

 return (
   <div className="signup-container">
     <div className={`signup-form step-${step}`}>
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
 );
};

export default SignUp;