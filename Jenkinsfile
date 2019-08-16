#! /usr/bin/env groovy

pipeline {
    agent { label 'docker' }
    environment {
        COMPOSE_PROJECT_NAME = 'canvas-alexa-lambda'
        COMPOSE_FILE = 'docker-compose.jenkins.yml'
    }

    stages {
        stage('Build') {
            steps {
                sh 'docker-compose build --no-cache'
                sh 'docker-compose up -d'
            }
        }
        stage('Lint') {
            steps {
                sh 'docker-compose run --rm alexa_unit_tests yarn lint-test'
            }
        }
        stage('Test') {
            steps {
                sh 'docker-compose run --rm alexa_unit_tests yarn test'
            }
            post {
                success {
                    sh 'docker cp $(docker-compose ps -q alexa_unit_tests):/usr/src/app/coverage .'
                    publishHTML target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'lcov-report/index.html',
                        reportName: 'JS Coverage Report'
                    ]
                }
            }
        }
    }
    post {
        cleanup {
            sh 'if [ -d "coverage" ]; then rm -rf "coverage"; fi'
            sh 'docker-compose down --volumes --remove-orphans --rmi all'
        }
    }
}
