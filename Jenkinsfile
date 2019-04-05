#! groovy
library 'pipeline-library'

def isPR = env.BRANCH_NAME.startsWith('PR-')
def runDanger = isPR

timestamps {
  def nodeVersion = '8.11.4'
  def npmVersion = 'latest'
  try {
    node('osx || linux') {
      stage('Checkout') {
        checkout([
          $class: 'GitSCM',
          branches: scm.branches,
          extensions: scm.extensions + [[$class: 'CleanBeforeCheckout']],
          userRemoteConfigs: scm.userRemoteConfigs
        ])
      }

      nodejs(nodeJSInstallationName: "node ${nodeVersion}") {
        ansiColor('xterm') {
          stage('Install') {
            timeout(15) {
              // Ensure we have npm
              ensureNPM(npmVersion)
              sh 'npm ci'
            } // timeout
          } // stage install

          stage('Lint and Test') {
            sh 'npm run lint'
            withEnv(['JUNIT_REPORT_PATH=junit_report.xml', 'MOCHA_REPORTER=mocha-jenkins-reporter']) {
              sh 'npm run test'
              stash includes: 'junit_report.xml', name: 'test-report'
            }
          } // stage lint and test
        } // ansiColor
      } // nodejs
    } // node
  } finally {
    if (runDanger) {
      stage('Danger') {
        node('osx || linux') {
          nodejs(nodeJSInstallationName: "node ${nodeVersion}") {
            checkout scm
            try {
              unstash 'test-report'
            } catch (e) {}
            ensureNPM(npmVersion)
            timeout(5) {
              sh 'npm ci'
            }
            withEnv(["DANGER_JS_APP_INSTALL_ID=''"]) {
              sh returnStatus: true, script: 'npx danger ci --verbose'
            } // withEnv
          } // nodejs
          deleteDir()
        } // node
      } // stage
    }
  }
} // timestamps
