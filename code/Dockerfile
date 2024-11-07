# Use Amazon Corretto 21 JDK as the base image
FROM public.ecr.aws/amazoncorretto/amazoncorretto:21-al2023-jdk

# Set the working directory
WORKDIR /app

# Copy the pre-built JAR file into the container with mvn clean package from the pipeline
COPY target/data-manager-0.0.1-SNAPSHOT.jar /app/app.jar

# Set the entry point to run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
