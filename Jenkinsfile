#! /usr/bin/env groovy

pipeline {
    agent { label 'docker' }
    stages {
        stage('Build') {
            steps {
                sh 'docker build --no-cache -t alexa_unit_tests-$BUILD_ID .'
            }
        }
        stage('Lint') {
            steps {
                sh 'docker run --rm alexa_unit_tests-$BUILD_ID yarn lint-test'
            }
        }
        stage('Test') {
            steps {
                sh 'docker run --rm alexa_unit_tests-$BUILD_ID yarn test --coverage'
            }
        }
    }
    post {
        cleanup {
            sh 'docker rmi alexa_unit_tests-$BUILD_ID'
        }
    }
}
