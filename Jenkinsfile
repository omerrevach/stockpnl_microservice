pipeline {
    agent {
        docker {
            image 'rebachi/stockpnl:slave'
            args '--user jenkinsuser'
            alwaysPull true
        }
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Run Test Command') {
            steps {
                sh 'echo "Pipeline is running securely!"'
            }
        }
    }
}
