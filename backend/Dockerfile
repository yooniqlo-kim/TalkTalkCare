FROM openjdk:17-jdk-slim
WORKDIR /app

# 프로젝트 복사
COPY . .

# Gradle Wrapper 실행 권한 추가
RUN chmod +x gradlew

# Gradle 빌드 실행 (테스트 제외)
RUN ./gradlew build -x test

COPY /app/build/libs/*.jar app.jar

# 실행 포트 노출
EXPOSE 8080

# 애플리케이션 실행
CMD ["java", "-jar", "app.jar"]
