# Dockerfile for data-manager Spring Boot application
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests
CMD ["java", "-jar", "target/data-manager-0.0.1-SNAPSHOT.jar"]
