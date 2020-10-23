pipeline {

    agent any

    // https://stackoverflow.com/a/48805385
    options {
        // disableConcurrentBuilds()
        throttle(['main'])
    }

    stages {
        stage('git clean') {
            steps{
                sh "/bin/sh docker/kbuild/jenkins/001-git-clean.sh"
            }
        }
        stage('memory clean') {
            steps{
                sh "/bin/bash /home/jenkins/clear_cache_step.sh"
            }
        }
        stage('build') {
            steps {
                script {
                    def statusCode
                    def isStartedByUser = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause').userName
                    //echo "isStartedByUser??"
                    //echo "--${isStartedByUser}--"
                    if (isStartedByUser) {
                        wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'XTerm']) {
                            // sh "/bin/sh docker/kbuild/jenkins/002-build.sh ${isStartedByUser}"
                            statusCode = sh(script:"/bin/sh docker/kbuild/jenkins/002-build.sh manual", returnStatus:true)
                        }
                    }
                    else {
                        wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'XTerm']) {
                            statusCode = sh(script:"/bin/sh docker/kbuild/jenkins/002-build.sh", returnStatus:true)
                        }
                    }
                    echo "statusCode:>${statusCode}<"
                    if (statusCode == 209) {
                        echo "[found]"
                        currentBuild.result = 'UNSTABLE'
                    }
                    else {
                        echo "[notfound]"
                        if (statusCode == 0) {
                            echo "[zero]"
                        }
                        else {
                            echo "[nonzero]"
                            currentBuild.result = 'FAILURE'
                        }
                    }
                    //def all = currentBuild.getBuildCauses()
                    //echo "all"
                    //echo "${all}"
                }
            }
        }
    }
}