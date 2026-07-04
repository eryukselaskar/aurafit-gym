const winstaller = require('electron-winstaller');
const path = require('path');

async function createInstaller() {
  console.log('Creating Windows Installer... Please wait.');
  try {
    await winstaller.createWindowsInstaller({
      appDirectory: path.join(__dirname, 'dist-desktop/AuraFit-win32-x64'),
      outputDirectory: path.join(__dirname, 'dist-installer'),
      authors: 'AuraFit Team',
      exe: 'AuraFit.exe',
      setupExe: 'AuraFit-Desktop-Setup.exe',
      noMsi: true,
      title: 'AuraFit',
      description: 'AuraFit Fitness & Workout Tracker'
    });
    console.log('Installer created successfully!');
  } catch (e) {
    console.error('Failed to create installer:', e.message);
  }
}

createInstaller();
