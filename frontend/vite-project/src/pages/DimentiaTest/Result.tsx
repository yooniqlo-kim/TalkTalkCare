import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../../styles/components/Result.css';
import Result from '../../components/layout/SMCQResult'; '../../components/layout/DimentiaResult';

const ResultPage: React.FC = () => {
    return (
      <div className="result-page">
        {/* 테스트 결과 */}
        <Result />
      </div>
    );
  };
  
  export default ResultPage;
