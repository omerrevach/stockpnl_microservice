#
FROM jenkins/inbound-agent:latest

# Install Docker inside the agent
USER root
RUN apt-get update && apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN adduser --disabled-password --gecos '' jenkinsuser

# Give Jenkins user access to Docker
RUN usermod -aG docker jenkinsuser

# Switch to non-root user
USER jenkinsuser

# Set working directory
WORKDIR /home/jenkinsuser

# Start the Jenkins agent
ENTRYPOINT ["jenkins-agent"]
