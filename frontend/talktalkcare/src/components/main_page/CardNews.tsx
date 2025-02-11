import React, { useState, useEffect } from "react";
import left_botton from '../../assets/left_botton.png';
import right_botton from '../../assets/right_botton.png';

const images = [
    { 
      image: "/images/news1.png", 
      title: "첫 번째 뉴스", 
      description: "이것은 첫 번째 카드 뉴스의 설명입니다." 
    },
    { 
      image: "/images/news2.png", 
      title: "두 번째 뉴스", 
      description: "이것은 두 번째 카드 뉴스의 설명입니다." 
    },
    { 
      image: "/images/news3.png", 
      title: "세 번째 뉴스", 
      description: "이것은 세 번째 카드 뉴스의 설명입니다." 
    },
    { 
      image: "/images/news4.png", 
      title: "네 번째 뉴스", 
      description: "이것은 네 번째 카드 뉴스의 설명입니다." 
    },
  ];

const CardNews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 슬라이드 (4초마다 변경)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // 다음 슬라이드
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // 이전 슬라이드
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full max-w-[800px] mx-auto">
    {/* 이미지 */}
    <img 
      src={images[currentIndex].image} 
      alt={images[currentIndex].title} 
      className="w-full h-auto object-cover"
    />

    {/* 제목 및 설명 */}
    <div className="absolute bottom-5 left-5 bg-amber-50 bg-opacity-50 p-4 rounded-lg" style={{ color: "#214005" }}>
      <h2 className="text-xl font-bold">{images[currentIndex].title}</h2>
      <p className="text-sm">{images[currentIndex].description}</p>
    </div>


        {/* 이전 버튼 */}
        <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-emerald-100 active:bg-emerald-100"
        >
            <img src={left_botton} alt="이전" className="w-8 h-10" />
        </button>

        {/* 다음 버튼 */}
        <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-emerald-100 active:bg-emerald-100"
        >
            <img src={right_botton} alt="다음" className="w-8 h-10" />
        </button>

      {/* 인디케이터 (슬라이드 위치 표시) */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-emerald-400" : "bg-emerald-100"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default CardNews;
