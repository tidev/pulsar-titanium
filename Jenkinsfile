#! groovy
library 'pipeline-library'

def branchName = env.BRANCH_NAME
def isPR = branchName.startsWith('PR-')
def runDanger = isPR

timestamps {
  def nodeVersion = '8.11.4'
  def npmVersion = 'latest'
  node('(osx || linux) && atom && !macos-wilder') {

    nodejs(nodeJSInstallationName: "node ${nodeVersion}") {
      ansiColor('xterm') {
        try {

          stage('Checkout') {
            checkout([
              $class: 'GitSCM',
              branches: scm.branches + [[name: 'master']],
              extensions: scm.extensions + [
                  [$class: 'LocalBranch'], // check out to local branch so we can git push on release job
                  [$class: 'CleanBeforeCheckout'],
                  [$class: 'CloneOption', noTags: false, shallow: false, depth: 0, reference: '']
                ],
              userRemoteConfigs: scm.userRemoteConfigs
            ])
            def result = sh (script: "git log -1 | grep '.*\\[ci skip\\].*'", returnStatus: true)
            sh 'git tag'
            skipBuild = (result == 0)
            ensureNPM(npmVersion)
          } // stage checkout

          // If previous commit contained [ci skip] then ignore
          if (skipBuild) {
            currentBuild.result = 'NOT_BUILT'
            return
          }
          stage('Install') {
            sh 'npm ci'
          } // stage install

          stage('Lint and Test') {
            sh 'npm run lint'
            withEnv(['JUNIT_REPORT_PATH=junit_report.xml', 'MOCHA_REPORTER=mocha-jenkins-reporter']) {
              try {
                sh 'npm run test'
              } finally {
                junit 'junit_report.xml'
              }
            }
          } // stage lint and test

          stage('Release') {
            if ('release'.equals(branchName)) {
              try{
                sh 'npm run release'
                def latestTag = sh(returnStdout: true, script: 'git describe --abbrev=0 --tags').trim()
                echo "Publishing ${latestTag}"
                pushGit(name: 'release')

                pushGitTag(name: latestTag, force: true)
                withCredentials([string(credentialsId: 'atom-io-api-key', variable: 'ATOM_ACCESS_TOKEN')]) {
                  sh "apm publish --tag ${latestTag}" // register that tag on atom.io
                }
              } catch (error) {
                def msg = "Failed to release"
                echo msg
                manager.addWarningBadge(msg)
                throw error
              }
            }
          } // stage release
        } finally {
          stage('Danger') {
            if (runDanger) {
              withEnv(["DANGER_JS_APP_INSTALL_ID=''"]) {
                sh returnStatus: true, script: 'npx danger ci --verbose'
              } // withEnv
            }
            deleteDir();
          } // stage
        }
      } // ansicolor
    } //nodejs
  } // node
} // timestamps
